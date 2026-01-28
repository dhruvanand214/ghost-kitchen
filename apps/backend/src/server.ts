import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { graphqlHTTP } from "express-graphql";

import { connectDB } from "./config/db";
import { schema } from "./graphql/schema";
import { root } from "./graphql/resolvers";
import { setupSocket } from "./sockets";
import { authMiddleware } from "./middleware/auth";
import otpRoutes from "./routes/otp.routes";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

/* -------------------- CORS (HTTP) -------------------- */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/* -------------------- Body parser -------------------- */
app.use(express.json());

/* -------------------- Socket.io -------------------- */
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

setupSocket(io);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

/* -------------------- Routes -------------------- */

app.use(express.json());
app.use("/api/otp", otpRoutes);

/* -------------------- GraphQL -------------------- */
app.use(
  "/graphql",
  authMiddleware, // now safe because OPTIONS is handled
  graphqlHTTP((req) => ({
    schema,
    rootValue: root,
    context: req,
    graphiql: true
  }))
);

/* -------------------- Health -------------------- */
app.get("/health", (_, res) => {
  res.send("Backend is running");
});

/* -------------------- Server -------------------- */
server.listen(4000, () => {
  console.log("🚀 Server running on http://localhost:4000");
});
