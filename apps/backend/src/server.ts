import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

app.get("/health", (_, res) => {
  res.send("Backend is running");
});

server.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
