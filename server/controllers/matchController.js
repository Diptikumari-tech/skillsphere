import User from "../models/User.js";

// @desc    Get AI/Smart skill matches for logged-in user
// @route   GET /api/matches
// @access  Private
export const getMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const myLearnSkills = (currentUser.learnSkills || []).map((s) => (s.name || s).toLowerCase().trim());
    const myTeachSkills = (currentUser.teachSkills || []).map((s) => (s.name || s).toLowerCase().trim());

    // Fetch all other users
    const candidateUsers = await User.find({ _id: { $ne: currentUser._id } }).select("-password");

    const matches = candidateUsers.map((candidate) => {
      const candTeachSkills = (candidate.teachSkills || []).map((s) => (s.name || s).toLowerCase().trim());
      const candLearnSkills = (candidate.learnSkills || []).map((s) => (s.name || s).toLowerCase().trim());

      // Skills candidate can teach that current user wants to learn
      const canTeachMe = (candidate.teachSkills || []).filter((s) =>
        myLearnSkills.includes((s.name || s).toLowerCase().trim())
      );

      // Skills current user can teach that candidate wants to learn
      const ICanTeachThem = (candidate.learnSkills || []).filter((s) =>
        myTeachSkills.includes((s.name || s).toLowerCase().trim())
      );

      const isMutualMatch = canTeachMe.length > 0 && ICanTeachThem.length > 0;
      const isOneWayMatch = canTeachMe.length > 0 || ICanTeachThem.length > 0;

      // Calculate deterministic compatibility score (0 - 100%)
      let matchScore = 0;

      if (isMutualMatch) {
        // High compatibility base for 2-way barter exchange
        matchScore = 70 + (canTeachMe.length - 1) * 10 + (ICanTeachThem.length - 1) * 10;
        if (currentUser.college && candidate.college && currentUser.college.toLowerCase() === candidate.college.toLowerCase()) {
          matchScore += 10;
        }
        matchScore = Math.min(99, Math.max(70, matchScore));
      } else if (isOneWayMatch) {
        // Medium compatibility for 1-way match
        matchScore = 45 + (canTeachMe.length + ICanTeachThem.length - 1) * 10;
        if (currentUser.course && candidate.course && currentUser.course.toLowerCase() === candidate.course.toLowerCase()) {
          matchScore += 5;
        }
        matchScore = Math.min(68, Math.max(45, matchScore));
      } else {
        // Category or background interest overlap
        const sharedLearnSkills = candLearnSkills.filter((s) => myLearnSkills.includes(s));
        if (sharedLearnSkills.length > 0) {
          matchScore = 25 + (sharedLearnSkills.length * 5);
        } else if (candTeachSkills.length > 0 || candLearnSkills.length > 0) {
          matchScore = 15;
        } else {
          matchScore = 5;
        }
        matchScore = Math.min(35, matchScore);
      }

      return {
        user: candidate,
        matchScore,
        canTeachMe,
        ICanTeachThem,
        isMutualMatch,
      };
    });

    // Sort by highest match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
