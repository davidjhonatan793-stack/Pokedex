// Variables globales
const listaPokemon = document.querySelector("#listaPokemon");
const botonesHeader = document.querySelectorAll(".btn-header");
const loadingIndicator = document.querySelector("#loadingIndicator");
const infoMessage = document.querySelector("#infoMessage");
const noResults = document.querySelector("#noResults");
const noResultsText = document.querySelector("#noResultsText");
const searchInput = document.querySelector("#searchInput");
const URL = "https://pokeapi.co/api/v2/pokemon/";

let allPokemon = [];
let currentType = "ver-todos";
let showingFavorites = false;

/*Lee favoritos desde localStorage si no hay favoritos guardados
devuelve array vacio*/
function getFavorites() {
    var favorites = localStorage.getItem('pokemonFavorites');
    if (favorites) {
        return JSON.parse(favorites);
    }
    return [];
}

//guarda array de ids de favoritos en localstorage
function saveFavorites(favorites) {
    localStorage.setItem('pokemonFavorites', JSON.stringify(favorites));
}

//verifica si un pokemon es favorito
function isFavorite(pokemonId) {
    var favorites = getFavorites();
    return favorites.indexOf(pokemonId) !== -1;
}

//agrega o quita un pokemon de favoritos
function toggleFavorite(pokemonId) {
    var favorites = getFavorites();
    var index = favorites.indexOf(pokemonId);

    if (index !== -1) {
        // quitar de favoritos
        favorites.splice(index, 1);
    } else {
        // agregar a favoritos
        favorites.push(pokemonId);
    }

    saveFavorites(favorites);

    // si estamos viendo favoritos, refrescar lista
    if (showingFavorites) {
        displayFilteredPokemon();
    }
}

// cargar un Pokemon especifico desde la API
function loadPokemon(id) {
    return fetch(URL + id)
        .then(function (response) {
            return response.json();
        });
}

function loadAllPokemon() {
    loadingIndicator.style.display = 'block';
    listaPokemon.innerHTML = '';

    var completed = 0;
    allPokemon = [];

    for (var i = 1; i <= 151; i++) {
        loadPokemon(i)
            .then(function (pokemon) {
                allPokemon.push(pokemon);
                completed++;

                if (completed === 151) {
                    displayFilteredPokemon();
                    loadingIndicator.style.display = 'none';
                }
            });
    }
}

// filtra y muestra pokemon segun busqueda, tipo o favoritos
function displayFilteredPokemon() {
    listaPokemon.innerHTML = '';
    let pokemonToShow = allPokemon;

    // mostrar solo favoritos
    if (showingFavorites) {
        const favorites = getFavorites();
        pokemonToShow = pokemonToShow.filter(p => favorites.includes(p.id));
        updateInfoMessage(pokemonToShow.length, "favoritos");
    }
    // mostrar por tipo
    else if (currentType !== "ver-todos") {
        pokemonToShow = pokemonToShow.filter(function (pokemon) {
            return pokemon.types.some(t => t.type.name === currentType);
        });
    }
    // mostrar todos
    else {
        updateInfoMessage(pokemonToShow.length);
    }

    // Filtrar por texto de búsqueda
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        pokemonToShow = pokemonToShow.filter(p => 
            p.name.toLowerCase().includes(searchTerm)
        );
        updateInfoMessage(pokemonToShow.length);
    } else if (!showingFavorites) {
        infoMessage.style.display = 'none';
    }

    if (pokemonToShow.length === 0) {
        showNoResults();
    } else {
        noResults.style.display = 'none';
        pokemonToShow.forEach(renderPokemon);
    }
} 

// Renderizar un Pokemon
function renderPokemon(pokemon) {
    var div = document.createElement("div");
    div.className = "pokemon";

    var tipos = "";
    for (var i = 0; i < pokemon.types.length; i++) {
        tipos += '<p class="' + pokemon.types[i].type.name + ' tipo">' +
            pokemon.types[i].type.name + '</p>';
    }

    var pokeId = String(pokemon.id);
    if (pokeId.length === 1) pokeId = "00" + pokeId;
    if (pokeId.length === 2) pokeId = "0" + pokeId;

    var isFav = isFavorite(pokemon.id);
    var favoriteClass = isFav ? 'is-favorite' : '';

    div.innerHTML = `
        <button class="favorite-btn ${favoriteClass}" data-id="${pokemon.id}">
            <svg class="heart-icon" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        </button>
        <div class="pokemon-imagen">
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        </div>
        <div class="pokemon-info">
            <div class="nombre-contenedor">
                <p class="pokemon-id">#${pokeId}</p>
                <h2 class="pokemon-nombre">${pokemon.name}</h2>
            </div>
            <div class="pokemon-tipos">${tipos}</div>
            <div class="pokemon-stats">
                <p class="stat">${pokemon.height}m</p>
                <p class="stat">${pokemon.weight}kg</p>
            </div>
        </div>
    `;

    var favoriteBtn = div.querySelector('.favorite-btn');
    favoriteBtn.onclick = function () {
        toggleFavorite(pokemon.id);
        this.classList.toggle('is-favorite');
    };

    listaPokemon.appendChild(div);
}

// Mensajes de informacion
function updateInfoMessage(count, mode) {
    if (mode === "favoritos") {
        infoMessage.textContent = `Tienes ${count} Pokémon favoritos ❤️`;
        infoMessage.style.display = 'block';
    } else if (searchInput.value.trim()) { // Agregamos .trim() para verificar que no sean solo espacios
        infoMessage.textContent = `Se encontraron ${count} resultado(s) para "${searchInput.value}"`;
        infoMessage.style.display = 'block';
    } else {
        infoMessage.style.display = 'none';
    }
}

function showNoResults() {
    noResults.style.display = 'block';
    if (searchInput.value) {
        noResultsText.textContent = 'No se encontraron Pokémon con el nombre "' + searchInput.value + '"';
    } else if (showingFavorites) {
        noResultsText.textContent = 'No tienes Pokémon favoritos aún ❤️';
    } else {
        noResultsText.textContent = 'No se encontraron Pokémon';
    }
}

// Eventos de busqueda en tiempo real
searchInput.addEventListener('input', function () {
    displayFilteredPokemon();
});

// Manejo de los botones del header
botonesHeader.forEach(function (boton) {
    boton.addEventListener("click", function (event) {
        var botonId = event.currentTarget.getAttribute('data-type');
        currentType = botonId;

        botonesHeader.forEach(function (btn) {
            btn.classList.remove('active');
        });
        event.currentTarget.classList.add('active');

        searchInput.value = '';

        if (botonId === 'favorite') {
            showingFavorites = true;
        } else {
            showingFavorites = false;
        }

        displayFilteredPokemon();
    });
});

function init() {
    loadAllPokemon();
}

init();
