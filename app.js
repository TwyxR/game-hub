/* ==========================================
   1. CONFIGURATION & GLOBAL STATE
   ========================================== */

// API Configuration (Used inside the Search Modal)
const API_KEY = "f97d3b0cfd9845a4ba7d4ec1765f6527";
const API_URL = `https://api.rawg.io/api/games?key=${API_KEY}`;

// LocalStorage Persistence Key
const STORAGE_KEY = "my_game_collection";

// Load user collection from localStorage or start empty
let myCollection = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// Global Filter States
let currentPlatform = "all";
let currentStatus = "all";
let currentSearch = "";

// Display Names Mapping for Statuses
const statusNames = {
  none: "Not Played",
  pending: "Plan to play",
  playing: "Playing",
  completed: "Completed",
  mastered: "Mastered",
  abandoned: "Dropped",
};

/* ==========================================
   2. STORAGE HELPERS
   ========================================== */

/**
 * Saves current personal collection array to localStorage
 */
function saveCollection() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(myCollection));
}

/* ==========================================
   3. UI RENDERERS (Main Grid & Platform Icons)
   ========================================== */

/**
 * Map list of platforms into FontAwesome family icons
 */
function renderPlatformIcons(platformsList = []) {
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
 * Render the game cards into the main grid container or display empty state
 */
function renderGames(gamesList) {
  const container = document.getElementById("games-grid");
  const emptyState = document.getElementById("empty-state");
  const gameCountLabel = document.getElementById("game-count");

  if (!container) return;

  container.innerHTML = "";

  // Update Game Counter Label
  if (gameCountLabel) {
    gameCountLabel.textContent = gamesList.length;
  }

  // Handle Empty Library or Empty Filter Results
  if (!gamesList || gamesList.length === 0) {
    container.style.display = "none";
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  // Hide empty state and show grid
  container.style.display = "grid";
  if (emptyState) emptyState.classList.add("hidden");

  // Render each card in personal collection
  gamesList.forEach((game) => {
    const platformIconsHTML = renderPlatformIcons(game.platforms);
    const card = document.createElement("div");
    card.classList.add("game-card");

    card.innerHTML = `
      <img src="${game.cover}" alt="${game.title}" class="game-cover" loading="lazy">
      <div class="game-info">
        <h3 class="game-title">${game.title}</h3>
        
        <div class="game-meta">
          <div class="platform-icons">${platformIconsHTML}</div>
          <span class="genre-tag">${game.genre || "Game"}</span>
        </div>
        
        <div class="status-selector-wrapper">
          <select class="status-select" data-id="${game.id}">
            <option value="none" ${game.status === "none" ? "selected" : ""}>Not played</option>
            <option value="pending" ${game.status === "pending" ? "selected" : ""}>Plan to play</option>
            <option value="playing" ${game.status === "playing" ? "selected" : ""}>Playing</option>
            <option value="completed" ${game.status === "completed" ? "selected" : ""}>Completed</option>
            <option value="mastered" ${game.status === "mastered" ? "selected" : ""}>Mastered</option>
            <option value="abandoned" ${game.status === "abandoned" ? "selected" : ""}>Dropped</option>
          </select>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  // Attach status change listeners to saved games
  container.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", (e) => {
      const gameId = e.target.getAttribute("data-id");
      const newStatus = e.target.value;

      const targetGame = myCollection.find(
        (g) => g.id.toString() === gameId.toString(),
      );
      if (targetGame) {
        targetGame.status = newStatus;
        saveCollection();
        filterGames();
      }
    });
  });
}

/* ==========================================
   4. FILTERING LOGIC
   ========================================== */

function filterGames() {
  const filtered = myCollection.filter((game) => {
    // Search text filter
    const matchesSearch = game.title
      .toLowerCase()
      .includes(currentSearch.toLowerCase());

    // Platform filter
    const matchesPlatform =
      currentPlatform === "all" ||
      (game.platforms &&
        game.platforms.some((p) =>
          p.toLowerCase().includes(currentPlatform.toLowerCase()),
        ));

    // State filter
    const matchesStatus =
      currentStatus === "all" || game.status === currentStatus;

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  renderGames(filtered);
}

/* ==========================================
   5. MODAL & RAWG SEARCH LOGIC
   ========================================== */

// Helper function to close modal
function closeModal() {
  const modalOverlay = document.getElementById("add-game-modal");
  if (modalOverlay) modalOverlay.classList.add("hidden");
}

/**
 * Search games directly from RAWG API
 */
async function searchRAWGGames(query) {
  const modalResultsContainer = document.getElementById("modal-search-results");
  if (!modalResultsContainer) return;

  modalResultsContainer.innerHTML = `<p class="loading-state" style="text-align:center; padding: 2rem;">Searching games...</p>`;

  try {
    const response = await fetch(
      `${API_URL}&search=${encodeURIComponent(query)}&page_size=6`,
    );
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      modalResultsContainer.innerHTML = `<p style="text-align:center; padding: 2rem;">No games found on RAWG.</p>`;
      return;
    }

    renderModalResults(data.results);
  } catch (error) {
    console.error("RAWG Search error:", error);
    modalResultsContainer.innerHTML = `<p style="text-align:center; color: red; padding: 2rem;">Error connecting to RAWG database.</p>`;
  }
}

/**
 * Render search result rows inside the modal
 */
function renderModalResults(results) {
  const modalResultsContainer = document.getElementById("modal-search-results");
  if (!modalResultsContainer) return;

  modalResultsContainer.innerHTML = "";

  results.forEach((game) => {
    const isAlreadySaved = myCollection.some(
      (g) => g.id.toString() === game.id.toString(),
    );
    const platforms = game.platforms
      ? game.platforms.map((p) => p.platform.name)
      : ["PC"];
    const coverUrl =
      game.background_image ||
      "https://via.placeholder.com/400x225?text=No+Cover";
    const genre =
      game.genres && game.genres.length > 0 ? game.genres[0].name : "Action";

    const item = document.createElement("div");
    item.classList.add("search-result-item");

    item.innerHTML = `
      <div class="search-result-info">
        <img src="${coverUrl}" alt="${game.name}" class="search-result-thumb">
        <div class="search-result-details">
          <h4>${game.name}</h4>
          <p>${platforms.join(", ")}</p>
        </div>
      </div>
      <button class="btn-add-to-lib ${isAlreadySaved ? "added" : ""}" data-id="${game.id}">
        ${isAlreadySaved ? '<i class="fas fa-check"></i> Added' : '<i class="fas fa-plus"></i> Add'}
      </button>
    `;

    modalResultsContainer.appendChild(item);

    // Event listener for Add Button
    const addBtn = item.querySelector(".btn-add-to-lib");
    if (addBtn && !isAlreadySaved) {
      addBtn.addEventListener("click", () => {
        const newGame = {
          id: game.id.toString(),
          title: game.name,
          platforms: platforms,
          genre: genre,
          cover: coverUrl,
          status: "pending", // Default status on add
        };

        myCollection.push(newGame);
        saveCollection();

        // Update button UI state
        addBtn.classList.add("added");
        addBtn.innerHTML = '<i class="fas fa-check"></i> Added';

        // Re-render main library grid behind modal
        filterGames();
      });
    }
  });
}

/* ==========================================
   6. INITIALIZATION & EVENT LISTENERS
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initial Theme Switcher setup
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

  // 2. Main Collection Live Search Bar Handler
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value;
      filterGames();
    });
  }

  // 3. Sidebar Filter Buttons Handler (Platforms and Statuses)
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.platform !== undefined) {
        currentPlatform = button.dataset.platform;
        document
          .querySelectorAll("[data-platform]")
          .forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
      }

      if (button.dataset.state !== undefined) {
        currentStatus = button.dataset.state;
        document
          .querySelectorAll("[data-state]")
          .forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
      }

      filterGames();
    });
  });

  // 4. Toggle 'See More' Platforms Dropdown Handler
  const togglePlatformsBtn = document.getElementById("toggle-platforms-btn");
  const morePlatformsContainer = document.getElementById("more-platforms");

  if (togglePlatformsBtn && morePlatformsContainer) {
    togglePlatformsBtn.addEventListener("click", () => {
      morePlatformsContainer.classList.toggle("hidden");
      togglePlatformsBtn.classList.toggle("open");

      const isExpanded = !morePlatformsContainer.classList.contains("hidden");
      const btnText = togglePlatformsBtn.querySelector("span");
      if (btnText) btnText.textContent = isExpanded ? "See less" : "See more";
    });
  }

  // 5. Modal Event Handlers Setup (Open, Close & Live Search)
  const addGameBtn = document.getElementById("add-game-btn");
  const modalOverlay = document.getElementById("add-game-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const modalSearchInput = document.getElementById("modal-search-input");
  const modalResultsContainer = document.getElementById("modal-search-results");

  if (addGameBtn && modalOverlay) {
    addGameBtn.addEventListener("click", () => {
      modalOverlay.classList.remove("hidden");
      if (modalSearchInput) modalSearchInput.focus();
    });
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Live Search inside Modal handler
  let searchDebounceTimeout = null;
  if (modalSearchInput) {
    modalSearchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();
      clearTimeout(searchDebounceTimeout);

      if (query.length < 2) {
        if (modalResultsContainer) {
          modalResultsContainer.innerHTML = `
            <div class="modal-empty-hint">
              <i class="fas fa-gamepad"></i>
              <p>Type a title above to search from RAWG database.</p>
            </div>`;
        }
        return;
      }

      searchDebounceTimeout = setTimeout(() => {
        searchRAWGGames(query);
      }, 400);
    });
  }

  // 6. Initial render of user's personal collection
  filterGames();
});
