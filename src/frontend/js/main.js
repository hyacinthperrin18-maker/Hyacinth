import "iconify-icon/dist/iconify-icon.js";

import * as d3 from "d3";

import "./chat.js";
import { backendUrl, socket } from "./socket.js";
import { readyButton, app } from "./users.js";

let session;
let users = [];

readyButton.addEventListener("click", () => {
    socket.emit("ready");
});

socket.on("users", (_users) => {
    users = _users;
    if (session) {
        updateTurnIndicator();
    }
});

socket.on("disconnect", () => {
    setInterval(() => {
        console.log("ping");
        fetch(`${backendUrl}/ping`)
            .then((response) => response.text())
            .then((data) => {
                if (data === "pong") {
                    window.location.reload();
                }
            })
            .catch(() => {});
    }, 1000);
});

const genreColors = {
    roman: "#a8d5ba", // vert sauge doux
    théâtre: "#f4c2c2", // rose poudré
    sf: "#b8d4e3", // bleu ciel pastel
    poésie: "#e6d5b8", // beige doré
    thriller: "#c9b8d4", // lavande doux
    policier: "#d4c4b0", // taupe clair
    feelgood: "#f5e6a3", // jaune crème
    aventures: "#d4a89a", // terracotta doux
    essai: "#c5c5c5", // gris doux
    humour: "#f0d4e8", // mauve rosé
    fantasy: "#a8c8d4", // bleu-gris doux
};

socket.on("session", (_session) => {
    if (!session) {
        session = _session;

        if (!session) return;

        readyButton.remove();
        document.body.classList.add("game-container");

        const svg = d3
            .select("body")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "calc(100vh - 200px)");

        // Ajouter un groupe pour les ombres
        const defs = svg.append("defs");

        // Filtre d'ombre pour les étagères
        const dropShadow = defs
            .append("filter")
            .attr("id", "drop-shadow")
            .attr("height", "130%");

        dropShadow
            .append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 3);

        dropShadow
            .append("feOffset")
            .attr("dx", 0)
            .attr("dy", 4)
            .attr("result", "offsetblur");

        const feMerge = dropShadow.append("feMerge");
        feMerge.append("feMergeNode");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        // Gradient pour les planches d'étagères
        const woodGradient = defs
            .append("linearGradient")
            .attr("id", "wood-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

        woodGradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#8B4513")
            .attr("stop-opacity", 1);

        woodGradient
            .append("stop")
            .attr("offset", "50%")
            .attr("stop-color", "#A0522D")
            .attr("stop-opacity", 1);

        woodGradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#654321")
            .attr("stop-opacity", 1);

        let y = 20; // Marge en haut
        for (const shelf of session.shelves) {
            const height = shelf.size * 62;

            // Ombre de l'étagère
            svg.append("rect")
                .attr("width", "100%")
                .attr("height", height + 15)
                .attr("x", 0)
                .attr("y", y + 5)
                .attr("fill", "rgba(0, 0, 0, 0.1)")
                .attr("filter", "url(#drop-shadow)");

            // Fond derrière les livres (mur)
            svg.append("rect")
                .attr("width", "100%")
                .attr("height", height)
                .attr("x", 0)
                .attr("y", y)
                .attr("fill", "rgba(0, 0, 0, 0.05)")
                .attr("stroke", "rgba(0, 0, 0, 0.1)")
                .attr("stroke-width", 1);

            const width = 100 / shelf.genres.length;

            let x = 0;
            for (const genre of shelf.genres) {
                // Zone de genre avec effet de lumière
                const genreGroup = svg.append("g");

                // Fond coloré
                genreGroup
                    .append("rect")
                    .attr("width", width + "%")
                    .attr("height", height)
                    .attr("x", x * width + "%")
                    .attr("y", y)
                    .attr("fill", genreColors[genre.type])
                    .attr("opacity", 0.7)
                    .attr("data-format", shelf.format)
                    .attr("data-genre", genre.type)
                    .attr("class", "shelf-zone");

                // Effet de brillance
                genreGroup
                    .append("rect")
                    .attr("width", width + "%")
                    .attr("height", height / 3)
                    .attr("x", x * width + "%")
                    .attr("y", y)
                    .attr("fill", "url(#shine-gradient)")
                    .attr("pointer-events", "none")
                    .attr("opacity", 0.3);

                // Séparateurs verticaux entre genres
                if (x > 0) {
                    svg.append("line")
                        .attr("x1", x * width + "%")
                        .attr("y1", y)
                        .attr("x2", x * width + "%")
                        .attr("y2", y + height)
                        .attr("stroke", "rgba(255, 255, 255, 0.3)")
                        .attr("stroke-width", 2)
                        .attr("pointer-events", "none");
                }

                // Étiquette de genre (optionnel, stylé)
                genreGroup
                    .append("text")
                    .attr("x", x * width + width / 2 + "%")
                    .attr("y", y + height - 10)
                    .attr("text-anchor", "middle")
                    .attr("fill", "rgba(0, 0, 0, 0.4)")
                    .attr("font-size", "12px")
                    .attr("font-weight", "bold")
                    .attr("pointer-events", "none")
                    .text(genre.type.toUpperCase());

                x++;
            }

            // Planche d'étagère (en dessous)
            const shelfBoard = svg.append("g");

            // Ombre de la planche
            shelfBoard
                .append("rect")
                .attr("width", "100%")
                .attr("height", 16)
                .attr("x", 0)
                .attr("y", y + height + 2)
                .attr("fill", "rgba(0, 0, 0, 0.2)");

            // Planche principale
            shelfBoard
                .append("rect")
                .attr("width", "100%")
                .attr("height", 14)
                .attr("x", 0)
                .attr("y", y + height)
                .attr("fill", "url(#wood-gradient)")
                .attr("rx", 2);

            // Reflet sur la planche
            shelfBoard
                .append("rect")
                .attr("width", "100%")
                .attr("height", 4)
                .attr("x", 0)
                .attr("y", y + height)
                .attr("fill", "rgba(255, 255, 255, 0.3)")
                .attr("rx", 2);

            // Texture de bois (lignes)
            for (let i = 0; i < 100; i += 15) {
                shelfBoard
                    .append("line")
                    .attr("x1", i + "%")
                    .attr("y1", y + height)
                    .attr("x2", i + "%")
                    .attr("y2", y + height + 14)
                    .attr("stroke", "rgba(0, 0, 0, 0.1)")
                    .attr("stroke-width", 1);
            }

            y += height + 25;
        }

        // Gradient de brillance
        const shineGradient = defs
            .append("linearGradient")
            .attr("id", "shine-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

        shineGradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#ffffff")
            .attr("stop-opacity", 1);

        shineGradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#ffffff")
            .attr("stop-opacity", 0);

        // Créer le carousel de livres en bas
        const booksCarousel = d3
            .select("body")
            .append("div")
            .attr("class", "books-carousel");

        // Créer l'indicateur de tour
        const turnIndicator = d3
            .select("body")
            .append("div")
            .attr("class", "turn-indicator");

        updateCarousel();
        updateTurnIndicator();
    } else {
        session = _session;
        updateCarousel();
        updateTurnIndicator();
    }
});

function updateTurnIndicator() {
    if (!session || users.length === 0) return;

    const currentPlayerIndex = session.currentPlayerIndex;
    const currentPlayer = users[currentPlayerIndex];
    const isMyTurn = currentPlayer?.socketId === socket.id;

    d3
        .select(".turn-indicator")
        .attr("class", isMyTurn ? "turn-indicator my-turn" : "turn-indicator")
        .html(`<p>Tour de : <strong>${
        currentPlayer?.username || "..."
    }</strong> ${isMyTurn ? "C'est vous !" : ""}</p>
               <p>Livres restants : ${session.availableBooks.length} / ${
        session.books.length
    }</p>`);
}

function updateCarousel() {
    if (!session) return;

    const carousel = d3.select(".books-carousel");
    const isMyTurn = users[session.currentPlayerIndex]?.socketId === socket.id;

    // Vider le carousel
    carousel.html("");

    // Créer le tapis roulant (2 copies pour l'effet de boucle)
    const track = carousel.append("div").attr("class", "books-track");

    // Dupliquer les livres pour créer une boucle infinie
    // On crée 3 copies pour assurer une transition fluide
    for (let copy = 0; copy < 3; copy++) {
        session.availableBooks.forEach((bookData) => {
            const book = track
                .append("div")
                .attr("class", "book")
                .attr("draggable", isMyTurn)
                .attr("data-book-id", bookData.id)
                .attr("data-format", bookData.format)
                .attr("data-genre", bookData.genre)
                .classed("disabled", !isMyTurn)
                .style("background-color", genreColors[bookData.genre])
                .style("height", sizes[bookData.format] * 60 + "px");

            book.append("div")
                .attr("class", "book-spine")
                .style("height", sizes[bookData.format] * 60 + "px");

            book.append("div").attr("class", "book-title").text(bookData.titre);

            book.append("div")
                .attr("class", "book-author")
                .text(bookData.auteur);

            book.on("dragstart", function (event) {
                handleDragStart(event, bookData);
            });
        });
    }

    // Ajuster la vitesse d'animation selon le nombre de livres (plus rapide maintenant !)
    const duration = Math.max(session.availableBooks.length * 0.8, 15);
    track.style("animation-duration", `${duration}s`);
}

function handleDragStart(event, d) {
    event.dataTransfer.setData("bookId", d.id);
    event.dataTransfer.effectAllowed = "move";
    event.target.classList.add("dragging");
}

const sizes = {
    poche: 1,
    medium: 2,
    grand: 3,
    maxi: 4,
};

// Gérer le drop sur les zones d'étagères
d3.select("body").on("dragover", function (event) {
    const target = event.target;
    if (target.classList.contains("shelf-zone")) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        target.classList.add("drop-hover");
    }
});

d3.select("body").on("dragleave", function (event) {
    const target = event.target;
    if (target.classList.contains("shelf-zone")) {
        target.classList.remove("drop-hover");
    }
});

d3.select("body").on("drop", function (event) {
    const target = event.target;
    if (target.classList.contains("shelf-zone")) {
        event.preventDefault();
        target.classList.remove("drop-hover");

        const bookId = event.dataTransfer.getData("bookId");
        const shelfFormat = target.dataset.format;
        const genreType = target.dataset.genre;

        socket.emit("placeBook", { bookId, shelfFormat, genreType });

        // Retirer la classe dragging
        document
            .querySelector(`[data-book-id="${bookId}"]`)
            ?.classList.remove("dragging");
    }
});

d3.select("body").on("dragend", function (event) {
    event.target.classList.remove("dragging");
});

socket.on("placementError", ({ message, bookId }) => {
    // Afficher une notification d'erreur
    const notification = d3
        .select("body")
        .append("div")
        .attr("class", "notification error")
        .text(message);

    // Faire clignoter le livre concerné
    if (bookId) {
        const book = document.querySelector(`[data-book-id="${bookId}"]`);
        if (book) {
            book.classList.add("shake");
            setTimeout(() => book.classList.remove("shake"), 500);
        }
    }

    setTimeout(() => notification.remove(), 3000);
});

socket.on("gameComplete", ({ message }) => {
    // Afficher un écran de victoire
    const victory = d3
        .select("body")
        .append("div")
        .attr("class", "victory-screen").html(`
            <div class="victory-content">
                <h1>${message}</h1>
                <p>Tous les livres ont été correctement rangés !</p>
                <button id="restart-game">Relancer une partie</button>
            </div>
        `);

    // Gérer le clic sur le bouton de relance
    d3.select("#restart-game").on("click", () => {
        socket.emit("restartGame");
    });
});

socket.on("restart", () => {
    window.location.reload();
});

const form = document.querySelector("form");
form.addEventListener(
    "submit",
    (/** @type {SubmitEvent & {target: HTMLFormElement}} */ event) => {
        event.preventDefault();
        const username = event.target.username.value;
        socket.emit("join", username);

        form.querySelector("button").textContent = "Rename";
    }
);
