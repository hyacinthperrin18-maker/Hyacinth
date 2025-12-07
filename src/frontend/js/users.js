import { socket } from "./socket.js";

/** @type {HTMLButtonElement} */
export const readyButton = document.querySelector("#ready");

const ul = document.querySelector("ul");

export const app = {
    me: null,
};

socket.on("users", (users) => {
    ul.innerHTML = users
        .map((user) => {
            const classList = ["user"];

            if (user.ready) {
                classList.push("ready");
            } else {
                classList.push("not-ready");
            }

            return `
                <li class="${classList.join(" ")}">
                    <iconify-icon icon="ph:user-circle-duotone"></iconify-icon>
                    ${user.username}
                </li>
            `;
        })
        .join("");

    app.me = users.find((user) => user.socketId === socket.id);

    readyButton.disabled = !app.me || app.me.ready;
});
