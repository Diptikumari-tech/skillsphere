import express from "express";
import { createReview, getReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getReviews)
  .post(protect, createReview);

router.get("/user/:userId", protect, getReviews);

export default router;
