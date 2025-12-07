import "../css/chat.css";
import { socket } from "./socket.js";

const chat = document.querySelector("#chat-container");
const form = chat.querySelector("form");
const input = form.querySelector("input");

const toggle = chat.querySelector(".toggle");

input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        console.log("aahahah");
        chat.classList.add("collapsed");
    }
});

toggle.addEventListener("click", () => {
    chat.classList.toggle("collapsed");
    if (!chat.classList.contains("collapsed")) {
        input.focus();
    }
});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector("input");
    socket.emit("message", input.value);
    input.value = "";
});

socket.on("messages", (messages) => {
    const messagesContainer = chat.querySelector(".messages");
    messagesContainer.innerHTML = messages
        .map((message, i) => {
            const me = socket.id === message.socketId;

            const previous = messages[i - 1];
            const next = messages[i + 1];

            const isSameUserPrev = previous?.socketId === message.socketId;
            const isSameUserNext = next?.socketId === message.socketId;

            let top = isSameUserPrev;
            let bottom = isSameUserNext;

            return `<div class="message${top ? " top" : ""}${
                bottom ? " bottom" : ""
            }${me ? " me" : ""}">
                    <span class="content">${message.content}</span>
                    ${
                        !isSameUserNext
                            ? `<span class="username">${message.username}</span>`
                            : ""
                    }
                </div>`;
        })
        .join("");

    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: "smooth",
    });
});
