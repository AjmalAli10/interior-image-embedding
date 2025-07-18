import dotenv from "dotenv";
import imageAnalysisService from "./src/services/imageAnalysisService.js";

dotenv.config();

const testImageUrl =
  "https://solsticeprod.s3.ap-south-1.amazonaws.com/digital-profiles/671/image_cropper_1729176750910.jpg";
const testImageId = "test_001";

async function testImageAnalysis() {
  try {
    console.log("Analyzing image...");
    console.log("Image URL:", testImageUrl);
    console.log("Image ID:", testImageId);
    console.log("---");

    const result = await imageAnalysisService.analyzeImage(
      testImageUrl,
      testImageId
    );

    console.log("Analysis Result:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testImageAnalysis();
