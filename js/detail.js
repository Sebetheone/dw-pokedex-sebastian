import {
    getPokemon,
    getPokemonSpecies
} from "./api.js";

const rootElm = document.querySelector("#root");

const params = new URLSearchParams(window.location.search);
const name = params.get("name");


async function setup() {

    if (!name) {
        rootElm.innerHTML = `
            <h1>Ingen Pokémon valgt</h1>
            <a href="index.html">Tilbage</a>
        `;
        return;
    }

    try {

        const pokemon = await getPokemon(name);

        const species = await getPokemonSpecies(
            pokemon.species.url
        );

        const prevPromise = pokemon.id > 1 ? getPokemon(String(pokemon.id - 1)) : Promise.resolve(null);
        const nextPromise = getPokemon(String(pokemon.id + 1));

        const [prevPokemon, nextPokemon] = await Promise.all([
            prevPromise.catch(() => null),
            nextPromise.catch(() => null)
        ]);

        showPokemon(pokemon, species, prevPokemon?.name, nextPokemon?.name);

    } catch (error) {

        console.error(error);

        rootElm.innerHTML = `
            <div style="padding: 30px; background: white;">
                <h1>Pokémon blev ikke fundet</h1>
                <p>Kunne ikke finde: ${name}</p>
                <a href="index.html">← Tilbage til Pokédex</a>
            </div>
        `;
    }
}


function showPokemon(pokemon, species, prevName, nextName) {

    const type = pokemon.types[0].type.name;
    const typeName = capitalize(type);

    document.body.style.background =
        `var(--${typeName})`;


    const descriptionEntry =
        species.flavor_text_entries.find(
            entry => entry.language.name === "en"
        );


    const description =
        descriptionEntry
            ? descriptionEntry.flavor_text
                .replace(/\f/g, " ")
                .replace(/\n/g, " ")
            : "No description available.";


    const image =
        pokemon.sprites.other["official-artwork"].front_default;

    rootElm.innerHTML = `

        <div
            class="pokemon-details"
            style="--pokemon-color: var(--${typeName})"
        >

            <section class="pokemon-hero">

                <header class="details-header">

                    <a
                        href="index.html"
                        class="back-button"
                    >
                        ←
                    </a>

                    <h1>
                        ${capitalize(pokemon.name)}
                    </h1>

                    <span>
                        #${String(pokemon.id).padStart(3, "0")}
                    </span>

                </header>


                <img 
                    class="pokeball-background"
                    src="assets/pokeball.svg"
                >

                ${prevName ? `
                    <a href="detail.html?name=${prevName}" class="nav-arrow prev-arrow">‹</a>
                ` : ''}

                <img
                    class="details-pokemon-image"
                    src="${image}"
                    alt="${pokemon.name}"
                >

                ${nextName ? `
                    <a href="detail.html?name=${nextName}" class="nav-arrow next-arrow">›</a>
                ` : ''}

            </section>


            <section class="pokemon-info">

                <div class="types">

                    ${pokemon.types.map(type => `

                        <span
                            class="type"
                            style="
                                background:
                                var(--${capitalize(type.type.name)})
                            "
                        >
                            ${capitalize(type.type.name)}
                        </span>

                    `).join("")}

                </div>


                <h2>
                    About
                </h2>


                <div class="about">

                    <div class="about-item">

                        <span>
                            ⚖ ${pokemon.weight / 10} kg
                        </span>

                        <small>
                            Weight
                        </small>

                    </div>


                    <div class="about-item">

                        <span>
                            ↕ ${pokemon.height / 10} m
                        </span>

                        <small>
                            Height
                        </small>

                    </div>


                    <div class="about-item">

                        <span>
                            ${capitalize(
                                pokemon.abilities[0].ability.name
                            )}
                        </span>

                        <small>
                            Ability
                        </small>

                    </div>

                </div>


                <p class="description">
                    ${description}
                </p>


                <h2>
                    Base Stats
                </h2>


                <div class="stats">

                    ${pokemon.stats.map(stat => `

                        <div class="stat">

                            <span class="stat-name">
                                ${getStatName(stat.stat.name)}
                            </span>

                            <span class="stat-value">
                                ${String(
                                    stat.base_stat
                                ).padStart(3, "0")}
                            </span>

                            <div class="stat-bar">

                                <div
                                    class="stat-fill"
                                    style="
                                        width:
                                        ${Math.min(
                                            stat.base_stat,
                                            100
                                        )}%;
                                    "
                                ></div>

                            </div>

                        </div>

                    `).join("")}

                </div>

            </section>

        </div>
    `;
}


function capitalize(text) {

    return text.charAt(0).toUpperCase()
        + text.slice(1);
}


function getStatName(name) {

    const names = {
        hp: "HP",
        attack: "ATK",
        defense: "DEF",
        "special-attack": "SATK",
        "special-defense": "SDEF",
        speed: "SPD"
    };

    return names[name] || name;
}


setup();