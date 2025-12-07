import "iconify-icon/dist/iconify-icon.js";

import * as d3 from "d3";

import "./chat.js";
import { backendUrl, socket } from "./socket.js";
import { readyButton } from "./users.js";

let session;

readyButton.addEventListener("click", () => {
    socket.emit("ready");
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
            .attr("height", "100%");

        let y = 0;
        for (const shelf of session.shelves) {
            const height = shelf.size * 62;

            const top = svg
                .append("rect")
                .attr("width", "100%")
                .attr("height", 2)
                .attr("x", 0)
                .attr("y", y)
                .attr("fill", "black");

            const bottom = svg
                .append("rect")
                .attr("width", "100%")
                .attr("height", 10)
                .attr("x", 0)
                .attr("y", y + height)
                .attr("fill", "brown");

            const width = 100 / shelf.genres.length;

            let x = 0;
            for (const genre of shelf.genres) {
                const rect = svg
                    .append("rect")
                    .attr("width", width + "%")
                    .attr("height", height - 2)
                    .attr("x", x * width + "%")
                    .attr("y", y + 2)
                    .attr("fill", genreColors[genre.type]);

                x++;
            }

            y += height + 10;
        }
    }

    session = _session;
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
