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

  // Get image by ID
  async getImageById(req, res, next) {
    try {
      const { id } = req.params;
      const image = await imageService.getImageById(id);

      if (!image) {
        return res.status(404).json({
          success: false,
          message: "Image not found",
        });
      }

      res.status(200).json({
        success: true,
        data: image,
        message: "Image retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Upload new image
  async uploadImage(req, res, next) {
    try {
      const imageData = req.body;
      const newImage = await imageService.uploadImage(imageData);

      res.status(201).json({
        success: true,
        data: newImage,
        message: "Image uploaded successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Generate embedding for image
  async generateEmbedding(req, res, next) {
    try {
      const { imageId } = req.body;
      const embedding = await imageService.generateEmbedding(imageId);

      res.status(200).json({
        success: true,
        data: embedding,
        message: "Embedding generated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Find similar images
  async findSimilarImages(req, res, next) {
    try {
      const { id } = req.params;
      const { limit = 10 } = req.query;

      const similarImages = await imageService.findSimilarImages(
        id,
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: similarImages,
        message: "Similar images found successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Update image metadata
  async updateImage(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedImage = await imageService.updateImage(id, updateData);

      if (!updatedImage) {
        return res.status(404).json({
          success: false,
          message: "Image not found",
        });
      }

      res.status(200).json({
        success: true,
        data: updatedImage,
        message: "Image updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete image
  async deleteImage(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await imageService.deleteImage(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Image not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Image deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ImageController();
