// 1. RAWG API Configuration
const API_KEY = "f97d3b0cfd9845a4ba7d4ec1765f6527"; // Replace with your RAWG API Key
const API_URL = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=20`;

// Global state to hold catalog games
let fetchedGames = [];

// 2. LocalStorage Helpers for User Game Statuses
function getUserStatuses() {
  const saved = localStorage.getItem("user_game_statuses");
  return saved ? JSON.parse(saved) : {};
}

function setGameStatus(gameId, newStatus) {
  const statuses = getUserStatuses();
  if (newStatus === "none") {
    delete statuses[gameId];
  } else {
    statuses[gameId] = newStatus;
  }
  localStorage.setItem("user_game_statuses", JSON.stringify(statuses));
}

// 3. Extended Status Display Names Mapping
const statusNames = {
  none: "Unplayed",
  pending: "Pending",
  playing: "Playing",
  played: "Played",
  completed: "Completed",
  mastered: "Mastered",
  abandoned: "Abandoned",
  archived: "Archived"
};

// 4. Helper function to map platform list into unique family icons
function renderPlatformIcons(platformsList) {
  const iconSet = new Set();

  platformsList.forEach((platformName) => {
    const name = platformName.toLowerCase();

    if (name.includes("playstation") || name.includes("ps")) {
      iconSet.add('<i class="fab fa-playstation" title="PlayStation"></i>');
    } else if (name.includes("xbox")) {
      iconSet.add('<i class="fab fa-xbox" title="Xbox"></i>');
    } else if (name.includes("nintendo") || name.includes("switch") || name.includes("wii")) {
      iconSet.add('<i class="fas fa-gamepad" title="Nintendo"></i>');
    } else if (name.includes("pc")) {
      iconSet.add('<i class="fas fa-desktop" title="PC"></i>');
    } else if (name.includes("mac") || name.includes("macos") || name.includes("apple")) {
      iconSet.add('<i class="fab fa-apple" title="macOS"></i>');
    } else if (name.includes("linux")) {
      iconSet.add('<i class="fab fa-linux" title="Linux"></i>');
    } else if (name.includes("android") || name.includes("ios")) {
      iconSet.add('<i class="fas fa-mobile-alt" title="Mobile"></i>');
    } else if (name.includes("web")) {
      iconSet.add('<i class="fas fa-globe" title="Web"></i>');
    }
  });

  return Array.from(iconSet).join(" ");
}

// 5. Render Games Grid Component
function renderGames(gamesList) {
  const container = document.getElementById("games-grid") || document.getElementById("games-container");
  const gameCountLabel = document.getElementById("game-count");
  
  if (!container) return;

  const userStatuses = getUserStatuses();
  container.innerHTML = "";

  // Render empty state message if filters yield no results
  if (gamesList.length === 0) {
    container.innerHTML = `<p class="no-results">No games found matching your active filters.</p>`;
    if (gameCountLabel) gameCountLabel.textContent = 0;
    return;
  }

  gamesList.forEach(game => {
    const currentStatus = userStatuses[game.id] || "none";
    const platformIconsHTML = renderPlatformIcons(game.platforms);

    const card = document.createElement("div");
    card.classList.add("game-card");

    card.innerHTML = `
      <img src="${game.cover}" alt="${game.title}" class="game-cover" loading="lazy">
      <div class="game-info">
        <h3 class="game-title">${game.title}</h3>
        
        <!-- Clean Separate Meta Structure -->
        <div class="game-meta">
          <div class="platform-icons">${platformIconsHTML}</div>
          <span class="genre-tag">${game.genre}</span>
        </div>
        
        <!-- Bottom-Aligned Status Selector -->
        <div class="status-selector-wrapper">
          <select id="status-${game.id}" class="status-select" data-id="${game.id}">
            <option value="none" ${currentStatus === "none" ? "selected" : ""}>Not played</option>
            <option value="pending" ${currentStatus === "pending" ? "selected" : ""}>Plan to play</option>
            <option value="playing" ${currentStatus === "playing" ? "selected" : ""}>Playing</option>
            <option value="played" ${currentStatus === "played" ? "selected" : ""}>Played</option>
            <option value="completed" ${currentStatus === "completed" ? "selected" : ""}>Completed</option>
            <option value="mastered" ${currentStatus === "mastered" ? "selected" : ""}>Mastered</option>
            <option value="abandoned" ${currentStatus === "abandoned" ? "selected" : ""}>Dropped</option>
            <option value="archived" ${currentStatus === "archived" ? "selected" : ""}>Archived</option>
          </select>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  // Attach change listener to dropdown selectors
  container.querySelectorAll(".status-select").forEach(select => {
    select.addEventListener("change", (e) => {
      const gameId = e.target.getAttribute("data-id");
      const newStatus = e.target.value;
      setGameStatus(gameId, newStatus);
      filterGames(); // Re-apply active filters dynamically
    });
  });

  // Update game counter label
  if (gameCountLabel) {
    gameCountLabel.textContent = gamesList.length;
  }
}

// 6. Async Fetch Games Catalog from RAWG API
async function loadCatalog() {
  const container = document.getElementById("games-grid") || document.getElementById("games-container");
  if (container) {
    container.innerHTML = `<p class="loading-state">Loading catalog from RAWG...</p>`;
  }

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    
    const data = await response.json();

    // Map raw API array response into internal structure
    fetchedGames = data.results.map(game => ({
      id: game.id.toString(),
      title: game.name,
      platforms: game.platforms ? game.platforms.map(p => p.platform.name) : ["PC"],
      genre: game.genres && game.genres.length > 0 ? game.genres[0].name : "Action",
      cover: game.background_image || "https://via.placeholder.com/400x225?text=No+Cover"
    }));

    renderGames(fetchedGames);
  } catch (error) {
    console.error("Error fetching games from RAWG API:", error);
    if (container) {
      container.innerHTML = `<p class="error-state">Failed to fetch games catalog. Check your internet connection or API Key.</p>`;
    }
  }
}

// 7. Combined Filter State Logic
let currentSearch = "";
let currentPlatform = "all";
let currentStatus = "all";

function filterGames() {
  const userStatuses = getUserStatuses();

  const filtered = fetchedGames.filter(game => {
    // Search query match
    const matchesSearch = game.title.toLowerCase().includes(currentSearch.toLowerCase());

    // Platform icon matching
    const matchesPlatform = currentPlatform === "all" || game.platforms.some(p => p.toLowerCase().includes(currentPlatform.toLowerCase()));

    // Library status matching
    const gameStatus = userStatuses[game.id] || "none";
    const matchesStatus = currentStatus === "all" || gameStatus === currentStatus;

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  renderGames(filtered);
}

// 8. Event Listeners for Controls
const searchInput = document.getElementById("search-input");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value;
    filterGames();
  });
}

const filterButtons = document.querySelectorAll(".filter-btn");
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (button.dataset.platform) {
      currentPlatform = button.dataset.platform;
      document.querySelectorAll("[data-platform]").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
    }

    if (button.dataset.status) {
      currentStatus = button.dataset.status;
      document.querySelectorAll("[data-status]").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
    }

    filterGames();
  });
});

// 9. Theme Switcher Handler with LocalStorage Persistence
const themeToggleInput = document.getElementById("theme-toggle-input");
const savedTheme = localStorage.getItem("theme");

// Apply initial state based on saved preference
if (savedTheme === "light") {
  document.documentElement.setAttribute("data-theme", "light");
  if (themeToggleInput) themeToggleInput.checked = true;
}

if (themeToggleInput) {
  themeToggleInput.addEventListener("change", (e) => {
    if (e.target.checked) {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
    }
  });
}

// 10. Initial Entry Point Trigger
document.addEventListener("DOMContentLoaded", () => {
  loadCatalog();
});