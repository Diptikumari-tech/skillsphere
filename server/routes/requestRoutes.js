import express from "express";
import {
  sendRequest,
  getRequests,
  respondToRequest,
} from "../controllers/requestController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getRequests)
  .post(protect, sendRequest);

router.put("/:id", protect, respondToRequest);

export default router;
