/* ==========================================
   1. CONFIGURATION & GLOBAL STATE
   ========================================== */

// IGDB API Configuration
const IGDB_CLIENT_ID = "eu8omzwjqjyxutv2dub243scxlu9uj";
const IGDB_ACCESS_TOKEN = "t1vyj21csj5w4purpvh9ecn8n8ofcj";
const PROXY_URL = "https://corsproxy.io/?";
const IGDB_API_URL = "https://api.igdb.com/v4/games";

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

function saveCollection() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(myCollection));
}

/* ==========================================
   3. UI RENDERERS (Main Grid & Platform Icons)
   ========================================== */

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
 * Render the game cards into the main grid container with platform frames
 */
function renderGames(gamesList) {
  const container = document.getElementById("games-grid");
  const emptyState = document.getElementById("empty-state");
  const gameCountLabel = document.getElementById("game-count");

  if (!container) return;

  container.innerHTML = "";

  if (gameCountLabel) {
    gameCountLabel.textContent = gamesList.length;
  }

  if (!gamesList || gamesList.length === 0) {
    container.style.display = "none";
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  container.style.display = "grid";
  if (emptyState) emptyState.classList.add("hidden");

  gamesList.forEach((game) => {
    const platformIconsHTML = renderPlatformIcons(game.platforms);
    const card = document.createElement("div");
    card.classList.add("game-card");

    if (game.status === "mastered") {
      card.classList.add("mastered-card");
    }

    // Determine cover box class (default to switch2 if not specified)
    const boxClass = game.selectedBox
      ? `platform-${game.selectedBox}`
      : "platform-switch2";

    card.innerHTML = `
      <div class="card-header-actions">
        <button class="delete-game-btn" data-id="${game.id}" title="Remove game">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
      
      <!-- Custom Cover Container with Frame Superposition -->
      <div class="cover-wrapper ${boxClass}">
        <img src="${game.cover}" alt="${game.title}" class="game-cover-art" loading="lazy">
        <div class="cover-frame"></div>
      </div>

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

  // Attach delete listeners
  container.querySelectorAll(".delete-game-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const gameTitle = e.currentTarget
        .closest(".game-card")
        .querySelector(".game-title").textContent;

      if (
        confirm(
          `Are you sure you want to remove "${gameTitle}" from your collection?`,
        )
      ) {
        const gameId = e.currentTarget.getAttribute("data-id");

        myCollection = myCollection.filter(
          (g) => g.id.toString() !== gameId.toString(),
        );
        saveCollection();
        filterGames();
      }
    });
  });

  // Attach status change listeners
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

/**
 * Render search result rows inside the modal with box selection
 */
function renderModalResults(results) {
  const modalResultsContainer = document.getElementById("modal-search-results");
  if (!modalResultsContainer) return;

  modalResultsContainer.innerHTML = "";

  results.forEach((game) => {
    const isAlreadySaved = myCollection.some(
      (g) => g.id.toString() === game.id.toString(),
    );

    const item = document.createElement("div");
    item.classList.add("search-result-item");

    item.innerHTML = `
      <div class="search-result-info">
        <img src="${game.cover}" alt="${game.title}" class="search-result-thumb">
        <div class="search-result-details">
          <h4>${game.title}</h4>
          <p>${game.platforms.join(", ")}</p>
        </div>
      </div>
      <div class="add-action-wrapper">
        ${
          isAlreadySaved
            ? `<button class="btn-add-to-lib added" disabled><i class="fas fa-check"></i> Added</button>`
            : `
              <select class="box-select" data-id="${game.id}">
                <option value="switch2">Switch 2</option>
                <option value="ps5">PS5</option>
              </select>
              <button class="btn-add-to-lib" data-id="${game.id}">
                <i class="fas fa-plus"></i> Add
              </button>
            `
        }
      </div>
    `;

    modalResultsContainer.appendChild(item);

    // Event listener for Add Button
    const addBtn = item.querySelector(".btn-add-to-lib");
    const boxSelect = item.querySelector(".box-select");

    if (addBtn && !isAlreadySaved) {
      addBtn.addEventListener("click", () => {
        const selectedBox = boxSelect ? boxSelect.value : "switch2";

        const newGame = {
          id: game.id,
          title: game.title,
          platforms: game.platforms,
          genre: game.genre,
          cover: game.cover,
          selectedBox: selectedBox, // Save platform box choice
          status: "pending",
        };

        myCollection.push(newGame);
        saveCollection();

        // Update button UI state
        addBtn.classList.add("added");
        addBtn.disabled = true;
        addBtn.innerHTML = '<i class="fas fa-check"></i> Added';
        if (boxSelect) boxSelect.style.display = "none";

        filterGames();
      });
    }
  });
}

/* ==========================================
   4. FILTERING LOGIC
   ========================================== */

function filterGames() {
  const filtered = myCollection.filter((game) => {
    const matchesSearch = game.title
      .toLowerCase()
      .includes(currentSearch.toLowerCase());

    const matchesPlatform =
      currentPlatform === "all" ||
      (game.platforms &&
        game.platforms.some((p) =>
          p.toLowerCase().includes(currentPlatform.toLowerCase()),
        ));

    const matchesStatus =
      currentStatus === "all" || game.status === currentStatus;

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  renderGames(filtered);
}

/* ==========================================
   5. MODAL & IGDB SEARCH LOGIC
   ========================================== */

function closeModal() {
  const modalOverlay = document.getElementById("add-game-modal");
  if (modalOverlay) modalOverlay.classList.add("hidden");
}

/**
 * Search games directly from IGDB API
 */
async function searchIGDBGames(query) {
  const modalResultsContainer = document.getElementById("modal-search-results");
  if (!modalResultsContainer) return;

  modalResultsContainer.innerHTML = `<p class="loading-state" style="text-align:center; padding: 2rem;">Searching IGDB...</p>`;

  try {
    const bodyQuery = `search "${query}"; fields name, cover.url, platforms.name, genres.name; limit 6;`;

    const response = await fetch(`${PROXY_URL}${IGDB_API_URL}`, {
      method: "POST",
      headers: {
        "Client-ID": IGDB_CLIENT_ID,
        Authorization: `Bearer ${IGDB_ACCESS_TOKEN}`,
        "Content-Type": "text/plain",
      },
      body: bodyQuery,
    });

    if (response.status === 429) {
      modalResultsContainer.innerHTML = `
        <div class="api-error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Rate limit reached. Please wait a moment and try again.</p>
        </div>`;
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      modalResultsContainer.innerHTML = `<p style="text-align:center; padding: 2rem;">No games found on IGDB.</p>`;
      return;
    }

    // Format results to standard application structure
    const formattedResults = data.map((game) => {
      let coverUrl = "https://via.placeholder.com/150x200?text=No+Cover";
      if (game.cover && game.cover.url) {
        coverUrl = `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`;
      }

      return {
        id: game.id.toString(),
        title: game.name,
        cover: coverUrl,
        platforms: game.platforms ? game.platforms.map((p) => p.name) : ["PC"],
        genre:
          game.genres && game.genres.length > 0 ? game.genres[0].name : "Game",
      };
    });

    renderModalResults(formattedResults);
  } catch (error) {
    console.error("IGDB Search error:", error);
    modalResultsContainer.innerHTML = `
      <div class="api-error-message">
        <i class="fas fa-wifi"></i>
        <p>Could not load games from IGDB. Check your connection or Token.</p>
      </div>`;
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

    const item = document.createElement("div");
    item.classList.add("search-result-item");

    item.innerHTML = `
      <div class="search-result-info">
        <img src="${game.cover}" alt="${game.title}" class="search-result-thumb">
        <div class="search-result-details">
          <h4>${game.title}</h4>
          <p>${game.platforms.join(", ")}</p>
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
          id: game.id,
          title: game.title,
          platforms: game.platforms,
          genre: game.genre,
          cover: game.cover,
          status: "pending",
        };

        myCollection.push(newGame);
        saveCollection();

        addBtn.classList.add("added");
        addBtn.innerHTML = '<i class="fas fa-check"></i> Added';

        filterGames();
      });
    }
  });
}

/* ==========================================
   6. INITIALIZATION & EVENT LISTENERS
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Theme Switcher setup
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

  // 2. Main Search Bar
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value;
      filterGames();
    });
  }

  // 3. Sidebar Filter Buttons
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

  // 4. Toggle Platforms
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

  // 5. Modal Setup & Live Search
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

  // Live Search
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
              <p>Type a title above to search from IGDB database.</p>
            </div>`;
        }
        return;
      }

      searchDebounceTimeout = setTimeout(() => {
        searchIGDBGames(query);
      }, 500);
    });
  }

  // 6. Initial Render
  filterGames();
});
