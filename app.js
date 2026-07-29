// 1. Array de datos (simula la respuesta de una base de datos o API)
const games = [
  {
    id: 1,
    title: "Divinity: Original Sin 2",
    platform: "pc",
    status: "completed",
    genre: "RPG",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Elden Ring",
    platform: "pc",
    status: "playing",
    genre: "Acción / RPG",
    image:
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "The Legend of Zelda: Tears of the Kingdom",
    platform: "switch",
    status: "completed",
    genre: "Aventura",
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "God of War Ragnarök",
    platform: "playstation",
    status: "backlog",
    genre: "Acción",
    image:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop",
  },
];

// 2. Selección de elementos del DOM
const gamesGrid = document.getElementById("games-grid");
const gameCountLabel = document.getElementById("game-count");

// 3. Función para renderizar el catálogo en la pantalla
function renderGames(gamesList) {
  // Limpiamos el contenedor por si había contenido previo
  gamesGrid.innerHTML = "";

  // Actualizamos el contador de juegos mostrados
  gameCountLabel.textContent = gamesList.length;

  // Si la lista está vacía, mostramos un mensaje
  if (gamesList.length === 0) {
    gamesGrid.innerHTML =
      "<p class='no-results'>No se encontraron juegos con esos filtros.</p>";
    return;
  }

  // Recorremos la lista de juegos con .forEach
  gamesList.forEach((game) => {
    // Creamos un elemento article para cada tarjeta
    const card = document.createElement("article");
    card.classList.add("game-card");

    // Formateamos el texto del estado para que quede bonito visualmente
    const statusText = {
      playing: "Jugando",
      completed: "Completado",
      backlog: "Pendiente",
    }[game.status];

    // Inyectamos el HTML de la tarjeta
    card.innerHTML = `
      <img src="${game.image}" alt="Portada de ${game.title}">
      <div class="game-info">
        <h3>${game.title}</h3>
        <div class="game-tags">
          <span class="tag">${game.platform.toUpperCase()}</span>
          <span class="tag">${game.genre}</span>
        </div>
        <div style="margin-top: 0.8rem; font-size: 0.85rem; color: var(--accent-color);">
          <strong>Estado:</strong> ${statusText}
        </div>
      </div>
    `;

    // Añadimos la tarjeta dentro de la rejilla
    gamesGrid.appendChild(card);
  });
}

// Ejecutamos la función por primera vez con toda la lista
renderGames(games);

// 4. Variables de estado para los filtros activos
let currentSearch = "";
let currentPlatform = "all";
let currentStatus = "all";

// 5. Función que aplica todos los filtros combinados
function filterGames() {
  const filtered = games.filter((game) => {
    // Coincidencia por texto de búsqueda (convertido a minúsculas)
    const matchesSearch = game.title
      .toLowerCase()
      .includes(currentSearch.toLowerCase());

    // Coincidencia por plataforma
    const matchesPlatform =
      currentPlatform === "all" || game.platform === currentPlatform;

    // Coincidencia por estado
    const matchesStatus =
      currentStatus === "all" || game.status === currentStatus;

    // Solo pasa si cumple las 3 condiciones a la vez
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  // Volvemos a renderizar las tarjetas con la lista filtrada
  renderGames(filtered);
}

// 6. Escuchador para la barra de búsqueda
const searchInput = document.getElementById("search-input");
searchInput.addEventListener("input", (e) => {
  currentSearch = e.target.value;
  filterGames(); // Filtramos cada vez que el usuario escribe una letra
});

// 7. Escuchadores para los botones de la barra lateral (Sidebar)
const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Si el botón pertenece al grupo de Plataformas
    if (button.dataset.platform) {
      currentPlatform = button.dataset.platform;

      // Actualizamos la clase 'active' en el grupo de plataforma
      document
        .querySelectorAll("[data-platform]")
        .forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
    }

    // Si el botón pertenece al grupo de Estados
    if (button.dataset.status) {
      currentStatus = button.dataset.status;

      // Actualizamos la clase 'active' en el grupo de estado
      document
        .querySelectorAll("[data-status]")
        .forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
    }

    filterGames();
  });
});

// 8. Funcionalidad de Modo Oscuro / Claro
const themeToggleBtn = document.getElementById("theme-toggle");

themeToggleBtn.addEventListener("click", () => {
  // Leemos el tema actual del elemento <html>
  const currentTheme = document.documentElement.getAttribute("data-theme");

  if (currentTheme === "light") {
    // Si está en claro, cambiamos a oscuro
    document.documentElement.removeAttribute("data-theme");
    themeToggleBtn.textContent = "🌙 Modo Oscuro";
  } else {
    // Si está en oscuro (por defecto), cambiamos a claro
    document.documentElement.setAttribute("data-theme", "light");
    themeToggleBtn.textContent = "☀️ Modo Claro";
  }
});