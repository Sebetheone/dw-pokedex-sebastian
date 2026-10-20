import { getAllPokemon } from "./api.js";

const rootElm = document.querySelector("#root");

let allPokemon = [];
let filteredPokemon = [];
let displayedIndex = 0;
const BATCH_SIZE = 20;

let currentSort = "number";
let searchQuery = "";
let loading = false;

async function setup() {

    rootElm.innerHTML = `
        <div class="pokedex">
            <header class="header">
                <h1><img src="assets/pokeball.svg">Pokédex</h1>
                <form id="searchForm">
                    <input id="searchInput" type="text" placeholder="Search Pokémon...">
                    <button type="button" id="sortBtn">#</button>
                </form>
            </header>
            <main class="pokemon-main">
                <div id="pokemonGrid" class="pokemon-grid"></div>
                <div id="loading" class="loading"> Loading... </div>
                <div id="scrollTrigger"></div>
            </main>
        </div>
    `;
    setupSearch();
    setupSort();

    allPokemon = await getAllPokemon();

    const loadingElm = document.querySelector("#loading");
    if (loadingElm) loadingElm.style.display = "none";

    applyFilterAndSort();
    setupInfiniteScroll();
}

setup();

function applyFilterAndSort() {
    const query = searchQuery.trim().toLowerCase();
    
    if (query) {
        filteredPokemon = allPokemon.filter(p => 
            p.name.toLowerCase().includes(query)
        );
    } else {
        filteredPokemon = [...allPokemon];
    }

    if (currentSort === "number") {
        filteredPokemon.sort((a, b) => getPokemonId(a.url) - getPokemonId(b.url));
    } else {
        filteredPokemon.sort((a, b) => a.name.localeCompare(b.name));
    }

    document.querySelector("#pokemonGrid").innerHTML = "";
    displayedIndex = 0;
    loadMorePokemon();
}

function loadMorePokemon() {
    if (loading || displayedIndex >= filteredPokemon.length) {
        return;
    }

    loading = true;

    const grid = document.querySelector("#pokemonGrid");
    const nextBatch = filteredPokemon.slice(displayedIndex, displayedIndex + BATCH_SIZE);

    nextBatch.forEach((pokemon) => {
        const card = createPokemonCard(pokemon);
        grid.appendChild(card);
    });

    displayedIndex += BATCH_SIZE;
    loading = false;
}

function createPokemonCard(pokemon) {

    const card = document.createElement("a");
    const id = getPokemonId(pokemon.url);

    card.classList.add("pokemon-card");
    card.href = `detail.html?name=${pokemon.name}`;

    card.innerHTML = `
        <span class="pokemon-number">
            #${String(id).padStart(3, "0")}
        </span>
        <img
            class="pokemon-image"
            src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
            data-src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png"
            alt="${pokemon.name}"
        >
        <p>
            ${capitalize(pokemon.name)}
        </p>
    `;

    lazyLoadImage(card.querySelector("img"));

    return card;
}

function getPokemonId(url) {
    const parts = url.split("/").filter(Boolean);
    return parseInt(parts[parts.length - 1], 10);
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function lazyLoadImage(img) {
    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = image.dataset.src;
                    image.removeAttribute("data-src");
                    observer.unobserve(image);
                }
            });
        }
    );

    observer.observe(img);
}

function setupInfiniteScroll() {
    const trigger = document.querySelector("#scrollTrigger");

    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && !loading) {
                loadMorePokemon();
            }
        },
        {
            rootMargin: "300px"
        }
    );

    observer.observe(trigger);
}

function setupSearch() {
    const form = document.querySelector("#searchForm");
    const input = document.querySelector("#searchInput");

    input.addEventListener("input", () => {
        searchQuery = input.value;
        applyFilterAndSort();
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
    });
}

function setupSort() {
    const sortBtn = document.querySelector("#sortBtn");

    sortBtn.addEventListener("click", () => {
        if (currentSort === "number") {
            currentSort = "alpha";
            sortBtn.textContent = "A-Z";
        } else {
            currentSort = "number";
            sortBtn.textContent = "#";
        }

        applyFilterAndSort();
    });
}