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
 * @type {null | {
 *  books: {}[];
 *  shelves: {
 *   format: string;
 *   size: number;
 *   genres: {
 *      type: string;
 *      books: {}[];
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
                items.push(item);
            }

            const genres = [...new Set(items.map((item) => item.genre))];
            const formats = [...new Set(items.map((item) => item.format))];

            session = {
                books: items,
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
});

server.listen(3000, () => {
    console.log("Server is running at http://localhost:3000");
});
