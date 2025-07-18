import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";

dotenv.config();

const client = new QdrantClient({
  url:
    process.env.QDRANT_URL ||
    "https://d5bd70d9-061d-4d95-bf97-b43e8c9f269e.us-west-1-0.aws.cloud.qdrant.io:6333",
  apiKey:
    process.env.QDRANT_API_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.B-G4MUfhH0LephFewNxC4WyxApOxSkQsm29wVOaa9Tg",
});

async function testQdrantConnection() {
  try {
    console.log("🔗 Testing Qdrant connection...");
    console.log(
      "URL:",
      process.env.QDRANT_URL ||
        "https://d5bd70d9-061d-4d95-bf97-b43e8c9f269e.us-west-1-0.aws.cloud.qdrant.io:6333"
    );

    const result = await client.getCollections();
    console.log("✅ Connection successful!");
    console.log("📊 Collections found:", result.collections.length);

    if (result.collections.length > 0) {
      console.log("📋 Existing collections:");
      result.collections.forEach((collection) => {
        console.log(
          `  - ${collection.name} (${collection.points_count} points)`
        );
      });
    } else {
      console.log("📋 No collections found - ready to create new ones!");
    }

    return true;
  } catch (err) {
    console.error("❌ Could not connect to Qdrant:", err.message);
    return false;
  }
}

// Run the test
testQdrantConnection().then((success) => {
  if (success) {
    console.log(
      "\n🎉 Qdrant is ready! You can now run the image processing pipeline."
    );
  } else {
    console.log("\n⚠️ Please check your Qdrant configuration.");
  }
});
