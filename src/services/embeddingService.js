import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

class EmbeddingService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async createMultiVectors(aiGeneratedTags, description, metadata) {
    const {
      room,
      theme,
      primary_features,
      objects,
      visual_attributes,
      indian_context,
    } = aiGeneratedTags;

    // 1. Primary Search Vector - Room, Theme, Regional Style
    const primarySearchText =
      `${room} ${theme} ${indian_context.regional_style} ${indian_context.space_utilization}`.toLowerCase();

    // 2. Semantic Description Vector - Detailed description and cultural context
    const semanticDescText = `${description} ${
      indian_context.cultural_significance
    } ${indian_context.modern_adaptations.join(" ")}`.toLowerCase();

    // 3. Object Focus Vector - Furniture, materials, features
    const objectTypes = objects.map((obj) => obj.type).join(" ");
    const objectFeatures = objects.flatMap((obj) => obj.features).join(" ");
    const materials = visual_attributes.materials.join(" ");
    const features = primary_features.join(" ");

    const objectFocusText =
      `${objectTypes} ${objectFeatures} ${materials} ${features} ${visual_attributes.colors.join(
        " "
      )}`.toLowerCase();

    // Generate all three embeddings
    const [primarySearchVector, semanticDescVector, objectFocusVector] =
      await Promise.all([
        this.getEmbedding(primarySearchText),
        this.getEmbedding(semanticDescText),
        this.getEmbedding(objectFocusText),
      ]);

    return {
      primary_search: primarySearchVector,
      semantic_desc: semanticDescVector,
      object_focus: objectFocusVector,
      embedding_texts: {
        primary_search: primarySearchText,
        semantic_desc: semanticDescText,
        object_focus: objectFocusText,
      },
    };
  }

  async getEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error("Error creating embedding:", error);
      throw new Error("Failed to create embedding");
    }
  }
}

export default new EmbeddingService();
