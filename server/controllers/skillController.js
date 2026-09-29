import Skill from "../models/Skill.js";
import User from "../models/User.js";

// @desc    Get user's or all skills
// @route   GET /api/skills
// @access  Private
export const getSkills = async (req, res) => {
  try {
    const { type, category } = req.query;
    let query = {};

    if (type) query.type = type;
    if (category) query.category = category;

    const skills = await Skill.find(query).populate("user", "name email college course avatar");
    res.json({ success: true, count: skills.length, skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a skill (offer or learn)
// @route   POST /api/skills
// @access  Private
export const createSkill = async (req, res) => {
  try {
    const { title, category, description, type, level, tags } = req.body;

    if (!title || !type) {
      return res.status(400).json({ success: false, message: "Title and type are required" });
    }

    const skill = await Skill.create({
      title,
      category: category || "Development",
      description: description || "",
      type,
      level: level || "Intermediate",
      tags: tags || [],
      user: req.user._id,
    });

    // Also update User profile array
    const user = await User.findById(req.user._id);
    if (type === "offer") {
      user.teachSkills.push({ name: title, level: level || "Intermediate", category: category || "General" });
    } else {
      user.learnSkills.push({ name: title, level: level || "Beginner", category: category || "General" });
    }
    await user.save();

    res.status(201).json({ success: true, skill, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Private
export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }

    if (skill.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized to delete this skill" });
    }

    await skill.deleteOne();
    res.json({ success: true, message: "Skill removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
