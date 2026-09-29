import express from "express";
import {
  scheduleSession,
  getSessions,
  getSessionById,
  updateSessionStatus,
} from "../controllers/sessionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getSessions)
  .post(protect, scheduleSession);

router.route("/:id")
  .get(protect, getSessionById)
  .put(protect, updateSessionStatus);

export default router;
