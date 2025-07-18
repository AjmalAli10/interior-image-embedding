import embeddingService from "../services/embeddingService.js";

class DataTransformer {
  async transformToQdrantFormat(modelResponse) {
    try {
      const {
        image_id,
        ai_generated_tags,
        confidence_scores,
        metadata,
        description,
      } = modelResponse;

      // Generate multi-vectors
      const multiVectors = await embeddingService.createMultiVectors(
        ai_generated_tags,
        description,
        metadata
      );

      // Extract object types and features
      const objectTypes = ai_generated_tags.objects.map((obj) =>
        obj.type.toLowerCase()
      );
      const objectFeatures = ai_generated_tags.objects.flatMap(
        (obj) => obj.features
      );

      // Create search tags
      const searchTags = this.createSearchTags(ai_generated_tags, metadata);

      return {
        id: image_id,
        vectors: multiVectors,
        payload: {
          // Multi-vector embedding texts
          embedding_texts: multiVectors.embedding_texts,

          // Primary searchable fields
          room_type: ai_generated_tags.room.toLowerCase(),
          design_theme: ai_generated_tags.theme.toLowerCase(),
          regional_style:
            ai_generated_tags.indian_context.regional_style.toLowerCase(),
          space_utilization:
            ai_generated_tags.indian_context.space_utilization.toLowerCase(),

          // Multi-value arrays for filtering
          colors: ai_generated_tags.visual_attributes.colors.map((c) =>
            c.toLowerCase()
          ),
          materials: ai_generated_tags.visual_attributes.materials.map((m) =>
            m.toLowerCase()
          ),
          primary_features: ai_generated_tags.primary_features.map((f) =>
            f.toLowerCase()
          ),
          object_types: objectTypes,
          object_features: objectFeatures.map((f) => f.toLowerCase()),

          // Confidence scores
          confidence_scores: confidence_scores,

          // Budget and space classification
          budget_category: metadata.budget_indicator.toLowerCase(),
          space_type: metadata.space_type.toLowerCase(),
          functionality: metadata.functionality.toLowerCase(),

          // Search optimization tags
          search_tags: searchTags,

          // Indian cultural context
          indian_specific: {
            traditional_elements:
              ai_generated_tags.indian_context.traditional_elements,
            modern_adaptations:
              ai_generated_tags.indian_context.modern_adaptations,
            cultural_significance:
              ai_generated_tags.indian_context.cultural_significance,
          },

          // Full original analysis
          original_analysis: modelResponse,

          // Timestamp and metadata
          created_at: new Date().toISOString(),
          image_url: modelResponse.image_url || null,
        },
      };
    } catch (error) {
      console.error("Error transforming data:", error);
      throw error;
    }
  }

  createSearchTags(aiGeneratedTags, metadata) {
    const tags = new Set();

    // Add basic tags
    tags.add(aiGeneratedTags.room.toLowerCase());
    tags.add(aiGeneratedTags.theme.toLowerCase());
    tags.add(aiGeneratedTags.indian_context.space_utilization.toLowerCase());

    // Add colors and materials
    aiGeneratedTags.visual_attributes.colors.forEach((color) =>
      tags.add(color.toLowerCase())
    );
    aiGeneratedTags.visual_attributes.materials.forEach((material) =>
      tags.add(material.toLowerCase())
    );

    // Add features
    aiGeneratedTags.primary_features.forEach((feature) =>
      tags.add(feature.toLowerCase())
    );

    // Add object types
    aiGeneratedTags.objects.forEach((obj) => {
      tags.add(obj.type.toLowerCase());
      obj.features.forEach((feature) => tags.add(feature.toLowerCase()));
    });

    // Add metadata tags
    if (metadata.tags) {
      metadata.tags.forEach((tag) => tags.add(tag.toLowerCase()));
    }

    return Array.from(tags);
  }

  async transformBatch(modelResponses) {
    const transformedData = [];

    for (const response of modelResponses) {
      try {
        const transformed = await this.transformToQdrantFormat(response);
        transformedData.push(transformed);
      } catch (error) {
        console.error(
          `Error transforming response for ${response.image_id}:`,
          error
        );
        // Continue with other items
      }
    }

    return transformedData;
  }
}

export default new DataTransformer();
