import imageService from "../services/imageService.js";

class ImageController {
  /**
   * Get all images from CSV
   */
  async getAllImages(req, res, next) {
    try {
      const images = await imageService.getAllImages();

      res.status(200).json({
        success: true,
        data: images,
        message: "Images retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search images using vector similarity in QdrantDB
   */
  async searchImages(req, res, next) {
    try {
      const { query, limit = 10 } = req.query;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: "Search query is required",
          message: "Please provide a search query",
        });
      }

      const searchResults = await imageService.searchImages(
        query.trim(),
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: searchResults,
        query: query.trim(),
        message: `Found ${searchResults.length} matching images`,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ImageController();
