// ==========================================
// 1. CONFIGURATION & MOCK FALLBACK DATA
// ==========================================

const API_KEY = "f97d3b0cfd9845a4ba7d4ec1765f6527";
const API_URL = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=20`;

// Global state to hold catalog games
let fetchedGames = [];

// Combined filter state variables
let currentSearch = "";
let currentPlatform = "all";
let currentStatus = "all";

// Local dataset used as a fallback if the external API fails
const FALLBACK_GAMES = [
  {
    id: "3498",
    title: "Grand Theft Auto V",
    platforms: ["PlayStation", "Xbox", "PC"],
    genre: "Action",
    cover:
      "https://media.rawg.io/media/games/20a/20aa03a10e53b5677a2d963004a30e20.jpg",
  },
  {
    id: "3328",
    title: "The Witcher 3: Wild Hunt",
    platforms: ["PlayStation", "Xbox", "PC", "Nintendo Switch"],
    genre: "RPG",
    cover:
      "https://media.rawg.io/media/games/618/618c47b6a41a3f28d77f775d116b2070.jpg",
  },
  {
    id: "4200",
    title: "Portal 2",
    platforms: ["PC", "Linux", "macOS", "PlayStation", "Xbox"],
    genre: "Shooter",
    cover:
      "https://media.rawg.io/media/games/2ba/2bac0e87cf45e5b508f227d281c92500.jpg",
  },
  {
    id: "5286",
    title: "Tomb Raider (2013)",
    platforms: ["PlayStation", "Xbox", "PC", "macOS"],
    genre: "Action",
    cover:
      "https://media.rawg.io/media/games/021/021c4e21a1824d2526f925eee6371b7f.jpg",
  },
  {
    id: "5679",
    title: "The Elder Scrolls V: Skyrim",
    platforms: ["PlayStation", "Xbox", "PC", "Nintendo Switch"],
    genre: "RPG",
    cover:
      "https://media.rawg.io/media/games/7cf/7cfc92f8ef7014febe1691c707b1d47f.jpg",
  },
  {
    id: "12020",
    title: "Left 4 Dead 2",
    platforms: ["PC", "Linux", "Xbox"],
    genre: "Shooter",
    cover:
      "https://media.rawg.io/media/games/46d/46d98e6910fbc0706e4fe7b8273463d3.jpg",
  },
  {
    id: "28",
    title: "Red Dead Redemption 2",
    platforms: ["PlayStation", "Xbox", "PC"],
    genre: "Action",
    cover:
      "https://media.rawg.io/media/games/511/5118211e409a6f0e08586a376c73426d.jpg",
  },
  {
    id: "13536",
    title: "Portal",
    platforms: ["PC", "Linux", "macOS", "PlayStation"],
    genre: "Puzzle",
    cover:
      "https://media.rawg.io/media/games/7fa/7fa0b586293c5861ee32490e953a4996.jpg",
  },
  {
    id: "4220",
    title: "Half-Life 2",
    platforms: ["PC", "Linux", "macOS", "Xbox"],
    genre: "Shooter",
    cover:
      "https://media.rawg.io/media/games/b8c/b8c243dfe0228fe965363c6b0b9716d2.jpg",
  },
  {
    id: "400",
    title: "BioShock Infinite",
    platforms: ["PlayStation", "Xbox", "PC", "Linux"],
    genre: "Shooter",
    cover:
      "https://media.rawg.io/media/games/fc1/fc1307a27745037bd509d1e65d0d5a2d.jpg",
  },
  {
    id: "802",
    title: "Borderlands 2",
    platforms: ["PlayStation", "Xbox", "PC", "Linux", "macOS"],
    genre: "Shooter",
    cover:
      "https://media.rawg.io/media/games/490/4901613b0fe0b9a32d4d7683f0b52a16.jpg",
  },
  {
    id: "3439",
    title: "Life is Strange",
    platforms: [
      "PlayStation",
      "Xbox",
      "PC",
      "Linux",
      "macOS",
      "Android",
      "iOS",
    ],
    genre: "Adventure",
    cover:
      "https://media.rawg.io/media/games/562/56255a61d7fea1085c52c415e4b4df2f.jpg",
  },
  {
    id: "4286",
    title: "BioShock",
    platforms: ["PlayStation", "Xbox", "PC", "macOS"],
    genre: "Shooter",
    cover:
      "https://media.rawg.io/media/games/4a0/4a0a13161a73694308a04f9ca8c9977d.jpg",
  },
  {
    id: "22511",
    title: "God of War (2018)",
    platforms: ["PlayStation", "PC"],
    genre: "Action",
    cover:
      "https://media.rawg.io/media/games/4be/4be662140a7a364bc513028d13261324.jpg",
  },
  {
    id: "32",
    title: "Destiny 2",
    platforms: ["PlayStation", "Xbox", "PC"],
    genre: "Shooter",
    cover:
      "https://media.rawg.io/media/games/34b/34b1f1850a1c06fd56650328a78d0e5f.jpg",
  },
  {
    id: "3070",
    title: "Fallout 4",
    platforms: ["PlayStation", "Xbox", "PC"],
    genre: "RPG",
    cover:
      "https://media.rawg.io/media/games/d82/d82369fc7f32373ab2ea638612c0ba28.jpg",
  },
  {
    id: "1030",
    title: "Limbo",
    platforms: [
      "PlayStation",
      "Xbox",
      "PC",
      "Linux",
      "macOS",
      "Nintendo Switch",
      "Android",
      "iOS",
    ],
    genre: "Puzzle",
    cover:
      "https://media.rawg.io/media/games/942/9424c6c2582e059a21a325d0b04a25b7.jpg",
  },
  {
    id: "10142",
    title: "PAYDAY 2",
    platforms: ["PlayStation", "Xbox", "PC", "Linux"],
    genre: "Shooter",
    cover:
      "https://media.rawg.io/media/games/73e/73e26264ed5a3b441c25803d1a737c4a.jpg",
  },
  {
    id: "1140",
    title: "Team Fortress 2",
    platforms: ["PC", "Linux", "macOS"],
    genre: "Shooter",
    cover:
      "https://media.rawg.io/media/games/46d/46d98e6910fbc0706e4fe7b8273463d3.jpg",
  },
  {
    id: "2454",
    title: "Doom (2016)",
    platforms: ["PlayStation", "Xbox", "PC", "Nintendo Switch"],
    genre: "Shooter",
    cover:
      "https://media.rawg.io/media/games/c4b/c4b011a847800e61006ec191e5095d72.jpg",
  },
];

// Display Names Mapping for Statuses
const statusNames = {
  none: "Unplayed",
  pending: "Pending",
  playing: "Playing",
  played: "Played",
  completed: "Completed",
  mastered: "Mastered",
  abandoned: "Abandoned",
  archived: "Archived",
};

// ==========================================
// 2. LOCALSTORAGE HELPERS
// ==========================================

/**
 * Get all user game status preferences from localStorage
 * @returns {Object} Saved statuses key-value pairs
 */
function getUserStatuses() {
  const saved = localStorage.getItem("user_game_statuses");
  return saved ? JSON.parse(saved) : {};
}

/**
 * Set status preference for a specific game
 * @param {string} gameId
 * @param {string} newStatus
 */
function setGameStatus(gameId, newStatus) {
  const statuses = getUserStatuses();
  if (newStatus === "none") {
    delete statuses[gameId];
  } else {
    statuses[gameId] = newStatus;
  }
  localStorage.setItem("user_game_statuses", JSON.stringify(statuses));
}

// ==========================================
// 3. UI HELPER FUNCTIONS & RENDERERS
// ==========================================

/**
 * Map list of platforms into FontAwesome family icons
 * @param {Array<string>} platformsList
 * @returns {string} String of HTML icon tags
 */
function renderPlatformIcons(platformsList) {
  const iconSet = new Set();

  platformsList.forEach((platformName) => {
    const name = platformName.toLowerCase();

    if (name.includes("playstation") || name.includes("ps")) {
      iconSet.add('<i class="fab fa-playstation" title="PlayStation"></i>');
    } else if (name.includes("xbox")) {
      iconSet.add('<i class="fab fa-xbox" title="Xbox"></i>');
    } else if (
      name.includes("nintendo") ||
      name.includes("switch") ||
      name.includes("wii")
    ) {
      iconSet.add('<i class="fas fa-gamepad" title="Nintendo"></i>');
    } else if (name.includes("pc")) {
      iconSet.add('<i class="fas fa-desktop" title="PC"></i>');
    } else if (
      name.includes("mac") ||
      name.includes("macos") ||
      name.includes("apple")
    ) {
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

/**
 * Render the game cards into the grid container
 * @param {Array<Object>} gamesList
 */
function renderGames(gamesList) {
  const container =
    document.getElementById("games-grid") ||
    document.getElementById("games-container");
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

  gamesList.forEach((game) => {
    const currentStatus = userStatuses[game.id] || "none";
    const platformIconsHTML = renderPlatformIcons(game.platforms);

    const card = document.createElement("div");
    card.classList.add("game-card");

    card.innerHTML = `
      <img src="${game.cover}" alt="${game.title}" class="game-cover" loading="lazy">
      <div class="game-info">
        <h3 class="game-title">${game.title}</h3>
        
        <div class="game-meta">
          <div class="platform-icons">${platformIconsHTML}</div>
          <span class="genre-tag">${game.genre}</span>
        </div>
        
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

  // Attach status dropdown change listeners
  container.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", (e) => {
      const gameId = e.target.getAttribute("data-id");
      const newStatus = e.target.value;
      setGameStatus(gameId, newStatus);
      filterGames();
    });
  });

  // Update game counter label
  if (gameCountLabel) {
    gameCountLabel.textContent = gamesList.length;
  }
}

// ==========================================
// 4. FILTERING LOGIC
// ==========================================

/**
 * Filter catalog dynamically based on active platform filter and state
 */
function filterGames() {
  const activePlatformBtn = document.querySelector(
    ".filter-btn[data-platform].active",
  );
  const selectedPlatform = activePlatformBtn
    ? activePlatformBtn.getAttribute("data-platform")
    : "all";

  const filtered = fetchedGames.filter((game) => {
    const matchesPlatform =
      selectedPlatform === "all" ||
      game.platforms.some((p) =>
        p.toLowerCase().includes(selectedPlatform.toLowerCase()),
      );

    return matchesPlatform;
  });

  renderGames(filtered);
}

// ==========================================
// 5. ASYNC DATA FETCHING & API RESILIENCE
// ==========================================

/**
 * Fetch games catalog from RAWG API or fallback to cached/local data
 */
async function loadCatalog() {
  const container =
    document.getElementById("games-grid") ||
    document.getElementById("games-container");

  // Check cached catalog for instant rendering
  const cachedGames = localStorage.getItem("cached_catalog_games");

  if (cachedGames) {
    fetchedGames = JSON.parse(cachedGames);
    renderGames(fetchedGames);
  } else if (container) {
    container.innerHTML = `<p class="loading-state">Loading catalog...</p>`;
  }

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    fetchedGames = data.results.map((game) => ({
      id: game.id.toString(),
      title: game.name,
      platforms: game.platforms
        ? game.platforms.map((p) => p.platform.name)
        : ["PC"],
      genre:
        game.genres && game.genres.length > 0 ? game.genres[0].name : "Action",
      cover:
        game.background_image ||
        "https://via.placeholder.com/400x225?text=No+Cover",
    }));

    // Cache successful response locally
    localStorage.setItem("cached_catalog_games", JSON.stringify(fetchedGames));
    renderGames(fetchedGames);
  } catch (error) {
    console.warn(
      "RAWG API connection failed (using cached/fallback local data):",
      error,
    );

    if (!fetchedGames || fetchedGames.length === 0) {
      fetchedGames = FALLBACK_GAMES;
      renderGames(fetchedGames);
    }
  }
}

// ==========================================
// 6. INITIALIZATION & EVENT LISTENERS
// ==========================================

// Initial Theme Switcher setup based on LocalStorage
const themeToggleInput = document.getElementById("theme-toggle-input");
const savedTheme = localStorage.getItem("theme");

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

// DOM Ready initialization
document.addEventListener("DOMContentLoaded", () => {
  // Load Catalog
  loadCatalog();

  // Search input handler
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value;
      filterGames();
    });
  }

  // Filter Buttons Handler (Platforms and Statuses)
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.platform) {
        currentPlatform = button.dataset.platform;
        document
          .querySelectorAll("[data-platform]")
          .forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
      }

      if (button.dataset.status) {
        currentStatus = button.dataset.status;
        document
          .querySelectorAll("[data-status]")
          .forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
      }

      filterGames();
    });
  });

  // Toggle 'See More' Platforms Dropdown Handler
  const togglePlatformsBtn = document.getElementById("toggle-platforms-btn");
  const morePlatformsContainer = document.getElementById("more-platforms");

  if (togglePlatformsBtn && morePlatformsContainer) {
    togglePlatformsBtn.addEventListener("click", () => {
      morePlatformsContainer.classList.toggle("hidden");
      togglePlatformsBtn.classList.toggle("open");

      const isExpanded = !morePlatformsContainer.classList.contains("hidden");
      const btnText = togglePlatformsBtn.querySelector("span");

      if (btnText) {
        btnText.textContent = isExpanded ? "See less" : "See more";
      }
    });
  }
});
