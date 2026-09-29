import Review from "../models/Review.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// @desc    Create a new review for a peer
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { revieweeId, rating, comment, skillName } = req.body;

    if (!revieweeId || !rating || !comment) {
      return res.status(400).json({ success: false, message: "Reviewee, rating, and comment are required" });
    }

    if (revieweeId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot review yourself" });
    }

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating: Number(rating),
      comment,
      skillName: skillName || "Skill Swap",
    });

    // Update reviewee average rating in User model
    const userReviews = await Review.find({ reviewee: revieweeId });
    const totalRating = userReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = (totalRating / userReviews.length).toFixed(1);

    await User.findByIdAndUpdate(revieweeId, {
      rating: {
        average: parseFloat(avgRating),
        count: userReviews.length,
      },
    });

    // Notify reviewee
    await Notification.create({
      recipient: revieweeId,
      sender: req.user._id,
      type: "review",
      title: "New Review Received ⭐",
      message: `${req.user.name} left you a ${rating}-star review!`,
      link: `/user/${req.user._id}`,
    });

    res.status(201).json({ success: true, review, message: "Review submitted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a user or current user
// @route   GET /api/reviews/:userId?
// @access  Private
export const getReviews = async (req, res) => {
  try {
    const targetUserId = req.params.userId || req.user._id;

    const reviews = await Review.find({ reviewee: targetUserId })
      .populate("reviewer", "name email avatar college course")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
