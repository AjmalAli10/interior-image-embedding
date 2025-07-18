// API Configuration
const API_BASE_URL = "http://localhost:3000/api";

// DOM Elements
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const status = document.getElementById("status");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const imagesGrid = document.getElementById("imagesGrid");

// State
let currentImages = [];
let isSearching = false;

// Event Listeners
searchBtn.addEventListener("click", handleSearch);
clearBtn.addEventListener("click", handleClear);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSearch();
  }
});

// Load all images on page load
document.addEventListener("DOMContentLoaded", () => {
  loadAllImages();
});

// Handle Search
async function handleSearch() {
  const query = searchInput.value.trim();

  if (query === "") {
    // If search is empty, load all images
    loadAllImages();
    return;
  }

  setLoading(true);
  setError("");

  try {
    const searchResults = await searchImages(query);
    displayImages(searchResults, `Search results for "${query}"`);
  } catch (err) {
    setError(`Search failed: ${err.message}`);
    console.error("Search error:", err);
  } finally {
    setLoading(false);
  }
}

// Handle Clear
function handleClear() {
  searchInput.value = "";
  loadAllImages();
}

// Load All Images from CSV
async function loadAllImages() {
  setLoading(true);
  setError("");

  try {
    const response = await fetch(`${API_BASE_URL}/images`);
    const data = await response.json();

    if (data.success) {
      displayImages(data.data, `All Images (${data.data.length} total)`);
    } else {
      throw new Error(data.message || "Failed to load images");
    }
  } catch (err) {
    setError(`Failed to load images: ${err.message}`);
    console.error("Load images error:", err);
  } finally {
    setLoading(false);
  }
}

// Search Images in QdrantDB
async function searchImages(query) {
  const response = await fetch(
    `${API_BASE_URL}/images/search?query=${encodeURIComponent(query)}&limit=10`
  );
  const data = await response.json();

  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.message || "Search failed");
  }
}

// Display Images
function displayImages(images, title) {
  currentImages = images;

  if (images.length === 0) {
    imagesGrid.innerHTML = `
      <div class="no-results">
        <h3>No images found</h3>
        <p>Try a different search term or browse all images</p>
      </div>
    `;
    setStatus(title);
    return;
  }

  const imagesHTML = images.map((image) => createImageCard(image)).join("");
  imagesGrid.innerHTML = imagesHTML;
  setStatus(title);
}

// Create Image Card HTML
function createImageCard(image) {
  const scoreHtml = image.score
    ? `<span class="score">Score: ${(image.score * 100).toFixed(1)}%</span>`
    : "";

  return `
    <div class="image-card" onclick="openImageModal('${image.image_url}', '${image.image_id}')">
      <div class="image-container">
        <img 
          src="${image.image_url}" 
          alt="${image.image_id}"
          loading="lazy"
          onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDMwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBsb2FkIGVycm9yPC90ZXh0Pgo8L3N2Zz4K'"
        >
      </div>
      <div class="image-info">
        <div class="image-id">${image.image_id}</div>
        ${scoreHtml}
      </div>
    </div>
  `;
}

// Open Image Modal (Simple implementation)
function openImageModal(imageUrl, imageId) {
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    cursor: pointer;
  `;

  modal.innerHTML = `
    <div style="max-width: 90%; max-height: 90%; position: relative;">
      <img 
        src="${imageUrl}" 
        alt="${imageId}"
        style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 10px;"
      >
      <div style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.7); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        ${imageId}
      </div>
    </div>
  `;

  modal.addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  document.body.appendChild(modal);
}

// Utility Functions
function setLoading(show) {
  isSearching = show;
  loading.style.display = show ? "block" : "none";
  searchBtn.disabled = show;
  status.style.display = show ? "none" : "block";
}

function setStatus(message) {
  status.textContent = message;
  status.style.display = "block";
}

function setError(message) {
  error.textContent = message;
  error.style.display = message ? "block" : "none";
}

// Add global function for image modal
window.openImageModal = openImageModal;
