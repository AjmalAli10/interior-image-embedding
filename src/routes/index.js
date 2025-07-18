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
    description: "Simple API for image listing and search",
    endpoints: {
      "GET /api/images": "Get all images from CSV",
      "GET /api/images/search":
        "Search images using vector similarity in QdrantDB",
    },
    queryParameters: {
      "GET /api/images/search": {
        query: "Search query (required)",
        limit: "Number of results (default: 10)",
      },
    },
    examples: {
      "Get all images": "GET /api/images",
      "Search for modern living rooms":
        "GET /api/images/search?query=modern living room&limit=5",
    },
  });
});

export default router;
