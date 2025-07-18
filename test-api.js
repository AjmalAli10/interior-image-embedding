import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000";

async function testAPI() {
  console.log("🧪 Testing Simple Image API\n");

  try {
    // Test 1: Get all images from CSV
    console.log("1. Testing get all images from CSV...");
    const imagesResponse = await fetch(`${BASE_URL}/api/images`);
    const imagesData = await imagesResponse.json();
    console.log("✅ Images retrieved from CSV:", imagesData.data.length);
    console.log("📊 Sample image:", imagesData.data[0]);
    console.log("");

    // Test 2: Search images in QdrantDB
    console.log("2. Testing search images in QdrantDB...");
    const searchResponse = await fetch(
      `${BASE_URL}/api/images/search?query=modern&limit=3`
    );
    const searchData = await searchResponse.json();
    console.log("✅ Search completed:", searchData.data.length, "results");
    console.log("🔍 Query:", searchData.query);
    console.log("📊 Sample result:", searchData.data[0]);
    console.log("");

    console.log("🎉 Both endpoints working successfully!");
    console.log("\n📋 API Summary:");
    console.log("- ✅ GET /api/images - Retrieves all images from CSV");
    console.log("- ✅ GET /api/images/search - Searches images in QdrantDB");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n💡 Make sure the server is running: npm start");
  }
}

// Run tests
testAPI();
