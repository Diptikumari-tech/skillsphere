import User from "../models/User.js";

// @desc    Get all users or search users
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res) => {
  try {
    const { search, skill } = req.query;
    let query = { _id: { $ne: req.user._id } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { college: { $regex: search, $options: "i" } },
        { course: { $regex: search, $options: "i" } },
        { "teachSkills.name": { $regex: search, $options: "i" } },
        { "learnSkills.name": { $regex: search, $options: "i" } },
      ];
    }

    if (skill) {
      query["teachSkills.name"] = { $regex: skill, $options: "i" };
    }

    const users = await User.find(query).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const {
      name,
      bio,
      college,
      course,
      year,
      location,
      avatar,
      teachSkills,
      learnSkills,
      socialLinks,
    } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (college !== undefined) user.college = college;
    if (course !== undefined) user.course = course;
    if (year !== undefined) user.year = year;
    if (location !== undefined) user.location = location;
    if (avatar !== undefined) user.avatar = avatar;
    if (socialLinks !== undefined) user.socialLinks = { ...user.socialLinks, ...socialLinks };

    if (Array.isArray(teachSkills)) {
      user.teachSkills = teachSkills.map((s) =>
        typeof s === "string" ? { name: s, level: "Intermediate", category: "General" } : s
      );
    }
    if (Array.isArray(learnSkills)) {
      user.learnSkills = learnSkills.map((s) =>
        typeof s === "string" ? { name: s, level: "Beginner", category: "General" } : s
      );
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        college: updatedUser.college,
        course: updatedUser.course,
        year: updatedUser.year,
        location: updatedUser.location,
        avatar: updatedUser.avatar,
        teachSkills: updatedUser.teachSkills,
        learnSkills: updatedUser.learnSkills,
        socialLinks: updatedUser.socialLinks,
        onboardingCompleted: updatedUser.onboardingCompleted,
      },
      message: "Profile updated successfully!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
