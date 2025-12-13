import path from "path";

import books from "./books.js";
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true,
    },
});

const sizes = {
    poche: 1,
    medium: 2,
    grand: 3,
    maxi: 4,
};

/**
 * @type {{
 *  socketId: string;
 *  username: string;
 *  ready: boolean;
 * }[]}
 */
const users = [];

/**
 * @type {{
 *  socketId: string;
 *  username: string;
 *  content: string;
 * }[]}
 */
const messages = [];

/**
 * @typedef {Object} Book
 * @property {string} id
 * @property {string} titre
 * @property {string} auteur
 * @property {string} [nom]
 * @property {string} genre
 * @property {string} format
 * @property {string} [littérature]
 */

/**
 * @type {null | {
 *  books: Book[];
 *  availableBooks: Book[];
 *  currentPlayerIndex: number;
 *  shelves: {
 *   format: string;
 *   size: number;
 *   genres: {
 *      type: string;
 *      books: Book[];
 *   }[];
 * }[];
 * }}
 */
let session = null;

app.get("/books.json", (req, res) => {
    res.json(books);
});

app.get("/ping", (req, res) => {
    res.send("pong");
});

io.on("connection", (socket) => {
    socket.emit("users", users);
    socket.emit("messages", messages);
    socket.emit("session", session);

    socket.on("join", (username) => {
        const user = users.find((user) => user.socketId === socket.id);
        if (user) {
            const alreadyExists = users.filter(
                (user) =>
                    user.username === username && user.socketId !== socket.id
            );

            if (alreadyExists?.length > 0) {
                username = `${username} (${alreadyExists.length + 1})`;
            }

            user.username = username;

            messages.forEach((msg) => {
                if (msg.socketId === user.socketId) {
                    msg.username = username;
                }
            });

            io.emit("messages", messages);
        } else {
            users.push({
                socketId: socket.id,
                username,
                ready: !!session,
            });

            messages.forEach((msg) => {
                if (msg.username === username) {
                    msg.socketId = socket.id;
                }
            });

            io.emit("messages", messages);
        }

        io.emit("users", users);
    });

    socket.on("disconnect", () => {
        const index = users.findIndex((user) => user.socketId === socket.id);
        if (index !== -1) {
            users.splice(index, 1);
        }

        if (users.length === 0) {
            session = null;
        }

        io.emit("users", users);
    });

    socket.on("ready", () => {
        const user = users.find((user) => user.socketId === socket.id);
        if (user) {
            user.ready = true;
        }

        io.emit("users", users);

        if (users.every((user) => user.ready) && !session) {
            const items = [];
            const bag = [...books];

            for (let i = 0; i < 30; i++) {
                const index = Math.floor(Math.random() * bag.length);
                const item = bag.splice(index, 1)[0];
                items.push({ ...item, id: `book-${i}` });
            }

            const genres = [...new Set(items.map((item) => item.genre))];
            const formats = [...new Set(items.map((item) => item.format))];

            session = {
                books: items,
                availableBooks: [...items],
                currentPlayerIndex: 0,
                shelves: formats.map((format) => ({
                    format,
                    size: sizes[format],
                    genres: genres.map((genre) => ({
                        type: genre,
                        books: [],
                    })),
                })),
            };

            io.emit("session", session);
        }
    });

    socket.on("message", (message) => {
        message = message.trim();

        if (!message) {
            return;
        }

        const user = users.find((user) => user.socketId === socket.id);

        if (user) {
            messages.push({
                socketId: socket.id,
                username: user.username,
                content: message,
            });

            io.emit("messages", messages);
        }
    });

    socket.on("placeBook", ({ bookId, shelfFormat, genreType }) => {
        if (!session) return;

        const user = users.find((user) => user.socketId === socket.id);
        if (!user) return;

        // Vérifier que c'est le tour de ce joueur
        const currentPlayer = users[session.currentPlayerIndex];
        if (currentPlayer.socketId !== socket.id) {
            socket.emit("placementError", {
                message: "Ce n'est pas votre tour !",
            });
            return;
        }

        // Trouver le livre dans availableBooks
        const bookIndex = session.availableBooks.findIndex(
            (book) => book.id === bookId
        );
        if (bookIndex === -1) {
            socket.emit("placementError", {
                message: "Ce livre n'est plus disponible",
            });
            return;
        }

        const book = session.availableBooks[bookIndex];

        // Valider que le livre va dans la bonne section (format + genre)
        if (book.format !== shelfFormat || book.genre !== genreType) {
            socket.emit("placementError", {
                message: "Ce livre ne va pas ici !",
                bookId,
            });
            return;
        }

        // Placer le livre
        const shelf = session.shelves.find((s) => s.format === shelfFormat);
        const genre = shelf.genres.find((g) => g.type === genreType);
        genre.books.push(book);

        // Retirer le livre des disponibles
        session.availableBooks.splice(bookIndex, 1);

        // Passer au joueur suivant
        session.currentPlayerIndex =
            (session.currentPlayerIndex + 1) % users.length;

        // Vérifier si tous les livres sont placés
        const gameComplete = session.availableBooks.length === 0;

        io.emit("session", session);

        if (gameComplete) {
            io.emit("gameComplete", {
                message: "Bravo ! Tous les livres sont rangés !",
            });
        }
    });

    socket.on("restartGame", () => {
        // Réinitialiser la session et les utilisateurs
        session = null;
        users.forEach((user) => {
            user.ready = false;
        });

        // Informer tous les clients de recharger la page
        io.emit("restart");
    });
});

server.listen(3000, () => {
    console.log("Server is running at http://localhost:3000");
});
