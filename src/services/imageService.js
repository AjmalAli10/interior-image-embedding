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
   * Search images using vector similarity in QdrantDB (with relevance filtering)
   */
  async searchImages(query, limit = 5) {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error("Search query is required");
      }

      console.log("Starting search for query:", query);

      // Use simple vector search that's working
      const qdrantService = await import("./qdrantService.js");
      
      // Get embedding for query
      const queryVector = await qdrantService.default.getEmbedding(query.trim());
      
      // Search with higher limit to filter later
      const searchResults = await qdrantService.default.client.search(
        "interior_images",
        {
          vector: { name: "primary_search", vector: queryVector },
          limit: parseInt(limit) * 3, // Get more to filter
          with_payload: true,
          with_vector: false,
        }
      );

      console.log("Raw search results found:", searchResults.length);
      
      // Debug: Log the first result to see payload structure
      if (searchResults.length > 0) {
        console.log("First result payload:", JSON.stringify(searchResults[0].payload, null, 2));
      }

      // Define relevance thresholds
      const HIGH_RELEVANCE_THRESHOLD = 0.85; // 85% similarity minimum
      const MIN_RELEVANCE_THRESHOLD = 0.75;   // 75% absolute minimum

      // Detect query intent (room type)
      const queryLower = query.toLowerCase();
      const detectedRoomType = this.detectRoomType(queryLower);
      
      // Filter and prioritize results
      let filteredResults = searchResults.filter(result => {
        // Apply minimum relevance threshold
        if (result.score < MIN_RELEVANCE_THRESHOLD) {
          return false;
        }
        
        // If we detected a specific room type, prioritize exact matches
        if (detectedRoomType && result.payload.room_type) {
          const resultRoomType = result.payload.room_type.toLowerCase();
          // Exact room type match with lower threshold
          if (resultRoomType === detectedRoomType) {
            return result.score >= 0.70; // Allow lower threshold for exact room matches
          }
          // Non-matching room types need higher threshold
          return result.score >= HIGH_RELEVANCE_THRESHOLD;
        }
        
        // General relevance for non-room-specific queries
        return result.score >= MIN_RELEVANCE_THRESHOLD;
      });

      // Sort by relevance: exact room type matches first, then by score
      filteredResults.sort((a, b) => {
        if (detectedRoomType) {
          const aIsExactMatch = a.payload.room_type?.toLowerCase() === detectedRoomType;
          const bIsExactMatch = b.payload.room_type?.toLowerCase() === detectedRoomType;
          
          if (aIsExactMatch && !bIsExactMatch) return -1;
          if (!aIsExactMatch && bIsExactMatch) return 1;
        }
        
        return b.score - a.score; // Higher score first
      });

      // Limit to requested number
      filteredResults = filteredResults.slice(0, parseInt(limit));

      console.log(`Filtered to ${filteredResults.length} highly relevant results`);

      // Transform results to match API contract
      const formattedResults = filteredResults.map((result) => ({
        image_id: result.payload.original_id,  // Fixed: use original_id from payload
        image_url: result.payload.image_url,
        score: result.score,
        room_type: result.payload.room_type,
        design_theme: result.payload.design_theme,
        budget_category: result.payload.budget_category,
        space_type: result.payload.space_type,
        // Add detailed tags and metadata
        tags: {
          colors: result.payload.colors || [],
          materials: result.payload.materials || [],
          primary_features: result.payload.primary_features || [],
          object_types: result.payload.object_types || [],
          functionality: result.payload.functionality || 'unknown',
          regional_style: result.payload.regional_style || 'unknown'
        },
        indian_context: result.payload.indian_specific || {},
        confidence_scores: result.payload.confidence_scores || {}
      }));

      // Return simple response format
      return {
        images: formattedResults,
        search_intelligence: {
          original_query: query.trim(),
          detected_room_type: detectedRoomType,
          min_similarity: Math.min(...formattedResults.map(r => r.score)),
          max_similarity: Math.max(...formattedResults.map(r => r.score)),
          enhancement_used: false,
          total_results: formattedResults.length,
          search_mode: "high_relevance_only"
        }
      };
    } catch (error) {
      console.error("Error searching images:", error);
      console.error("Error stack:", error.stack);
      throw new Error(`Failed to search images: ${error.message}`);
    }
  }

  /**
   * Detect room type from query
   */
  detectRoomType(queryLower) {
    const roomTypeMap = {
      'bedroom': ['bedroom', 'bed room', 'sleeping'],
      'kitchen': ['kitchen', 'cooking', 'culinary'],
      'living room': ['living room', 'living', 'lounge', 'family room'],
      'bathroom': ['bathroom', 'bath', 'toilet', 'washroom'],
      'dining room': ['dining room', 'dining', 'eating'],
      'home office': ['office', 'study', 'workspace', 'work'],
      'entrance': ['entrance', 'entry', 'foyer', 'hall'],
      'staircase': ['staircase', 'stairs', 'steps']
    };

    for (const [roomType, keywords] of Object.entries(roomTypeMap)) {
      if (keywords.some(keyword => queryLower.includes(keyword))) {
        return roomType;
      }
    }
    
    return null; // No specific room type detected
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
