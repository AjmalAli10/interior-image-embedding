import imageService from "../services/imageService.js";

class ImageController {
  // Get all images
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
}

export default new ImageController();
