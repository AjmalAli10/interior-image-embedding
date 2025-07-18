import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import qdrantService from "./qdrantService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImageService {
  constructor() {
    this.csvPath = path.join(__dirname, "../data/interior-image-urls.csv");
  }

  /**
   * Get all images from CSV
   */
  async getAllImages() {
    try {
      const csvData = await this.readCSVFile();
      const images = this.parseCSVData(csvData);
      return images;
    } catch (error) {
      console.error("Error getting all images:", error);
      throw new Error("Failed to retrieve images");
    }
  }

  /**
   * Search images using vector similarity in QdrantDB
   */
  async searchImages(query, limit = 5) {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error("Search query is required");
      }

      // Perform vector search using Qdrant
      const searchResults = await qdrantService.search(
        { text: query.trim() },
        limit
      );

      // Transform results to match API contract
      const formattedResults = searchResults.map((result) => ({
        image_id: result.payload.image_id,
        image_url: result.payload.image_url,
        score: result.score,
      }));

      return formattedResults;
    } catch (error) {
      console.error("Error searching images:", error);
      throw new Error("Failed to search images");
    }
  }

  // Private helper methods
  async readCSVFile() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.csvPath, "utf8", (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  parseCSVData(csvData) {
    const lines = csvData.trim().split("\n");
    const headers = lines[0].split(",");

    return lines.slice(1).map((line) => {
      const values = line.split(",");
      const image = {};

      headers.forEach((header, index) => {
        image[header.trim()] = values[index]?.trim() || "";
      });

      return image;
    });
  }
}

export default new ImageService();
