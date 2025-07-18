import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";

dotenv.config();

class QdrantService {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL || "http://localhost:6333",
      apiKey: process.env.QDRANT_API_KEY, // Optional for local setup
    });
    this.collectionName = "interior_images";
  }

  async createCollection() {
    try {
      // First check if collection already exists
      const collections = await this.client.getCollections();
      const collectionExists = collections.collections.some(
        (col) => col.name === this.collectionName
      );

      if (collectionExists) {
        console.log(`Collection ${this.collectionName} already exists, skipping creation`);
        return;
      }

      await this.client.createCollection(this.collectionName, {
        vectors: {
          // Multi-vector configuration using OpenAI text-embedding-ada-002 (1536 dimensions)
          primary_search: {
            size: 1536,
            distance: "Cosine",
          },
          semantic_desc: {
            size: 1536,
            distance: "Cosine",
          },
          object_focus: {
            size: 1536,
            distance: "Cosine",
          },
        },
        optimizers_config: {
          default_segment_number: 2,
        },
        replication_factor: 1,
      });

      // Create payload indexes for fast filtering
      try {
        await this.client.createPayloadIndex(this.collectionName, {
          field_name: "room_type",
          field_schema: "keyword",
        });

        await this.client.createPayloadIndex(this.collectionName, {
          field_name: "design_theme",
          field_schema: "keyword",
        });

        await this.client.createPayloadIndex(this.collectionName, {
          field_name: "budget_category",
          field_schema: "keyword",
        });

        await this.client.createPayloadIndex(this.collectionName, {
          field_name: "space_type",
          field_schema: "keyword",
        });
      } catch (indexError) {
        console.log("Some indexes may already exist, continuing...");
      }

      console.log(`Collection ${this.collectionName} created successfully`);
    } catch (error) {
      console.error("Error creating collection:", error);
      throw error;
    }
  }

  async upsertPoints(points) {
    try {
      await this.client.upsert(this.collectionName, {
        points: points,
      });
      console.log(`Successfully upserted ${points.length} points`);
    } catch (error) {
      console.error("Error upserting points:", error);
      throw error;
    }
  }

  async search(
    query,
    limit = 10,
    filters = {},
    weights = { primary_search: 0.5, semantic_desc: 0.3, object_focus: 0.2 }
  ) {
    try {
      // Generate embedding for the query text
      const queryText = query.text || query.primary_search || query;
      const queryVector = await this.getEmbedding(queryText);

      const searchParams = {
        vector: {
          name: "primary_search",
          vector: queryVector
        },
        limit: limit,
        with_payload: true,
        with_vector: false,
      };

      if (Object.keys(filters).length > 0) {
        searchParams.filter = this.buildFilter(filters);
      }

      const response = await this.client.search(
        this.collectionName,
        searchParams
      );
      return response;
    } catch (error) {
      console.error("Error in search:", error);
      throw error;
    }
  }

  async getEmbedding(text) {
    // Import embedding service dynamically to avoid circular dependency
    const { default: embeddingService } = await import(
      "../services/embeddingService.js"
    );
    return await embeddingService.getEmbedding(text);
  }

  buildFilter(filters) {
    const must = [];

    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        must.push({
          key: key,
          match: { any: value },
        });
      } else {
        must.push({
          key: key,
          match: { value: value },
        });
      }
    });

    return { must };
  }

  /**
   * Get a specific point by ID
   */
  async getPointById(pointId) {
    try {
      const response = await this.client.retrieve(this.collectionName, {
        ids: [pointId],
        with_payload: true,
        with_vector: false,
      });

      return response.length > 0 ? response[0] : null;
    } catch (error) {
      console.error("Error retrieving point by ID:", error);
      return null;
    }
  }

  /**
   * Get search suggestions for autocomplete
   */
  async getSearchSuggestions() {
    try {
      // Get a sample of points to extract unique values
      const response = await this.client.scroll(this.collectionName, {
        limit: 100,
        with_payload: true,
        with_vector: false,
      });

      const suggestions = {
        room_types: new Set(),
        design_themes: new Set(),
        budget_categories: new Set(),
        space_types: new Set(),
      };

      response.points.forEach((point) => {
        if (point.payload.room_type)
          suggestions.room_types.add(point.payload.room_type);
        if (point.payload.design_theme)
          suggestions.design_themes.add(point.payload.design_theme);
        if (point.payload.budget_category)
          suggestions.budget_categories.add(point.payload.budget_category);
        if (point.payload.space_type)
          suggestions.space_types.add(point.payload.space_type);
      });

      return {
        room_types: Array.from(suggestions.room_types),
        design_themes: Array.from(suggestions.design_themes),
        budget_categories: Array.from(suggestions.budget_categories),
        space_types: Array.from(suggestions.space_types),
      };
    } catch (error) {
      console.error("Error getting search suggestions:", error);
      return {
        room_types: [],
        design_themes: [],
        budget_categories: [],
        space_types: [],
      };
    }
  }
}

export default new QdrantService();
