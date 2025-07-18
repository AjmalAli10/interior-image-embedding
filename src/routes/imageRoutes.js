import express from "express";
const router = express.Router();
import imageController from "../controllers/imageController.js";

// GET /api/images - Get all images
router.get("/", imageController.getAllImages);

export default router;
