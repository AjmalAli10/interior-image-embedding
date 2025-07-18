import qdrantService from "../src/services/qdrantService.js";

// Example search queries using the unified multi-vector search API

async function searchExamples() {
  console.log("🔍 Multi-Vector Search Examples\n");

  // Example 1: Simple text search (uses all three vectors with default weights)
  console.log("1. Simple Search for Modern Indian Bedrooms:");
  const bedroomResults = await qdrantService.search(
    { text: "modern indian bedroom" },
    5,
    {
      room_type: "bedroom",
      design_theme: "modern indian",
    }
  );

  console.log(`Found ${bedroomResults.length} results\n`);

  // Example 2: Specialized search with custom weights
  console.log("2. Furniture-Focused Search:");
  const furnitureResults = await qdrantService.search(
    { object_focus: "wooden bed storage wardrobe" },
    5,
    { materials: ["wood"] },
    { primary_search: 0.2, semantic_desc: 0.2, object_focus: 0.6 }
  );

  console.log(`Found ${furnitureResults.length} results\n`);

  // Example 3: Multi-dimensional search
  console.log("3. Multi-Dimensional Search:");
  const multiResults = await qdrantService.search(
    {
      primary_search: "bedroom",
      semantic_desc: "modern indian design with cultural elements",
      object_focus: "bed wardrobe storage",
    },
    5,
    { budget_category: "mid-range" },
    { primary_search: 0.4, semantic_desc: 0.4, object_focus: 0.2 }
  );

  console.log(`Found ${multiResults.length} results\n`);

  // Example 4: Color-focused search
  console.log("4. Color Scheme Search:");
  const colorResults = await qdrantService.search(
    { object_focus: "white brown color scheme" },
    5,
    { colors: ["white", "brown"] },
    { primary_search: 0.1, semantic_desc: 0.2, object_focus: 0.7 }
  );

  console.log(`Found ${colorResults.length} results\n`);

  // Example 5: Cultural context search
  console.log("5. Cultural Context Search:");
  const culturalResults = await qdrantService.search(
    { semantic_desc: "traditional indian elements with modern adaptations" },
    5,
    {},
    { primary_search: 0.1, semantic_desc: 0.8, object_focus: 0.1 }
  );

  console.log(`Found ${culturalResults.length} results\n`);
}

// Example of how to use the search results
async function processSearchResults(results) {
  console.log("📊 Processing Search Results:");

  results.forEach((result, index) => {
    console.log(`\n${index + 1}. Image: ${result.id}`);
    console.log(`   Score: ${result.score.toFixed(3)}`);
    console.log(`   Room: ${result.payload.room_type}`);
    console.log(`   Theme: ${result.payload.design_theme}`);
    console.log(`   Colors: ${result.payload.colors.join(", ")}`);
    console.log(`   Materials: ${result.payload.materials.join(", ")}`);
  });
}

// Run examples
searchExamples().catch(console.error);

export { searchExamples, processSearchResults };
