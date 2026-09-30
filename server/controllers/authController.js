import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, college, course, year } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    const user = await User.create({
      name,
      email,
      password,
      college: college || "",
      course: course || "",
      year: year || "",
    });

    if (user) {
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          college: user.college,
          course: user.course,
          year: user.year,
          role: user.role,
          avatar: user.avatar,
          onboardingCompleted: user.onboardingCompleted,
          teachSkills: user.teachSkills,
          learnSkills: user.learnSkills,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          bio: user.bio,
          college: user.college,
          course: user.course,
          year: user.year,
          location: user.location,
          avatar: user.avatar,
          onboardingCompleted: user.onboardingCompleted,
          teachSkills: user.teachSkills,
          learnSkills: user.learnSkills,
          socialLinks: user.socialLinks,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete Onboarding Profile
// @route   POST /api/auth/onboarding
// @access  Private
export const completeOnboarding = async (req, res) => {
  try {
    const { bio, college, course, year, location, teachSkills, learnSkills } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (bio !== undefined) user.bio = bio;
    if (college !== undefined) user.college = college;
    if (course !== undefined) user.course = course;
    if (year !== undefined) user.year = year;
    if (location !== undefined) user.location = location;

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

    user.onboardingCompleted = true;
    await user.save();

    res.json({
      success: true,
      user,
      message: "Onboarding profile saved successfully!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
