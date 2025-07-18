import express from "express";
const router = express.Router();

// Import route modules
import imageRoutes from "./imageRoutes.js";

// Mount routes
router.use("/images", imageRoutes);

// API info endpoint
router.get("/", (req, res) => {
  res.json({
    message: "Interior Image Embedding API",
    version: "1.0.0",
    endpoints: {
      images: "/api/images",
    },
  });
});

export default router;
