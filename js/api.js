const API_URL = "https://pokeapi.co/api/v2";

export async function getAllPokemon() {
    const response = await fetch(`${API_URL}/pokemon?limit=1025`);
    const data = await response.json();
    return data.results;
}

export async function getPokemonList(url = `${API_URL}/pokemon?limit=20`) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

export async function getPokemon(name) {
    const response = await fetch(
        `${API_URL}/pokemon/${String(name).toLowerCase()}`
    );

    if (!response.ok) {
        throw new Error("Pokemon blev ikke fundet");
    }

    const pokemon = await response.json();
    return pokemon;
}

export async function getPokemonSpecies(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}