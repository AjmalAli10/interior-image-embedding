import dotenv from "dotenv";

dotenv.config();

console.log("HF_TOKEN exists:", !!process.env.HF_TOKEN);
console.log(
  "HF_TOKEN length:",
  process.env.HF_TOKEN ? process.env.HF_TOKEN.length : 0
);
console.log(
  "HF_TOKEN starts with:",
  process.env.HF_TOKEN
    ? process.env.HF_TOKEN.substring(0, 10) + "..."
    : "Not set"
);
