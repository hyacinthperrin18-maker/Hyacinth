import { io } from "socket.io-client";

export const backendUrl = "http://192.168.1.10:3000";

export const socket = io(backendUrl);
