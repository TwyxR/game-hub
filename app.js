// 1. Datos del catálogo inicial (Tipo tienda/biblioteca)
const initialGames = [
  {
    id: "dos2",
    title: "Divinity: Original Sin 2",
    platforms: ["PC"],
    genre: "RPG",
    cover:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "elden",
    title: "Elden Ring",
    platforms: ["PC", "PlayStation", "Xbox Series X/S"],
    genre: "Acción / RPG",
    cover:
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "totk",
    title: "The Legend of Zelda: Tears of the Kingdom",
    platforms: ["Nintendo Switch"],
    genre: "Aventura",
    cover:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "gowr",
    title: "God of War Ragnarök",
    platforms: ["PlayStation", "PC"],
    genre: "Acción",
    cover:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=400&q=80",
  },
];

// 2. Funciones para leer y guardar en localStorage (Tienen que estar fuera)
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

// 3. Selección de elementos del DOM
const gamesGrid = document.getElementById("games-grid");
const gameCountLabel = document.getElementById("game-count");

// 4. Función para renderizar el catálogo en la pantalla
function renderGames(gamesList) {
  // Buscamos por ID 'games-grid' o 'games-container' para asegurar compatibilidad con tu HTML
  const container = document.getElementById("games-grid") || document.getElementById("games-container");
  if (!container) return;

  const userStatuses = getUserStatuses();
  container.innerHTML = "";

  gamesList.forEach(game => {
    const currentStatus = userStatuses[game.id] || "none";

    const card = document.createElement("div");
    card.classList.add("game-card");

    card.innerHTML = `
      <img src="${game.cover}" alt="${game.title}" class="game-cover">
      <div class="game-info">
        <h3>${game.title}</h3>
        <p class="game-meta">${game.platforms.join(" • ")} | ${game.genre}</p>
        
        <div class="status-selector-wrapper">
          <label for="status-${game.id}">Estado:</label>
          <select id="status-${game.id}" class="status-select" data-id="${game.id}">
            <option value="none" ${currentStatus === "none" ? "selected" : ""}>➕ Sin añadir</option>
            <option value="pending" ${currentStatus === "pending" ? "selected" : ""}>⏳ Pendiente</option>
            <option value="playing" ${currentStatus === "playing" ? "selected" : ""}>🎮 Jugando</option>
            <option value="completed" ${currentStatus === "completed" ? "selected" : ""}>🏆 Completado</option>
          </select>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  // Escuchar cuando el usuario cambie la opción del desplegable
  document.querySelectorAll(".status-select").forEach(select => {
    select.addEventListener("change", (e) => {
      const gameId = e.target.getAttribute("data-id");
      const newStatus = e.target.value;
      setGameStatus(gameId, newStatus);
    });
  });

  // Actualizar el contador si existe el elemento
  if (gameCountLabel) {
    gameCountLabel.textContent = gamesList.length;
  }
}

// 5. Variables de estado para los filtros activos
let currentSearch = "";
let currentPlatform = "all";
let currentStatus = "all";

// 6. Función que aplica todos los filtros combinados
function filterGames() {
  const userStatuses = getUserStatuses();

  const filtered = initialGames.filter((game) => {
    // A) Filtro por Búsqueda de texto
    const matchesSearch = game.title
      .toLowerCase()
      .includes(currentSearch.toLowerCase());

    // B) Filtro por Plataforma (comprueba si el array de plataformas del juego incluye la seleccionada)
    const matchesPlatform =
      currentPlatform === "all" || game.platforms.includes(currentPlatform);

    // C) Filtro por Estado (lee de localStorage)
    const gameStatus = userStatuses[game.id] || "none";
    const matchesStatus =
      currentStatus === "all" || gameStatus === currentStatus;

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  renderGames(filtered);
}

// 7. Escuchador para la barra de búsqueda
const searchInput = document.getElementById("search-input");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value;
    filterGames();
  });
}

// 8. Escuchadores para los botones de la barra lateral (Sidebar)
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

// 9. Funcionalidad de Modo Oscuro / Claro con LocalStorage
const themeToggleBtn = document.getElementById("theme-toggle");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  document.documentElement.setAttribute("data-theme", "light");
  if (themeToggleBtn) themeToggleBtn.textContent = "☀️ Modo Claro";
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");

    if (currentTheme === "light") {
      document.documentElement.removeAttribute("data-theme");
      themeToggleBtn.textContent = "🌙 Modo Oscuro";
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      themeToggleBtn.textContent = "☀️ Modo Claro";
      localStorage.setItem("theme", "light");
    }
  });
}

// 10. Renderizado Inicial
renderGames(initialGames);