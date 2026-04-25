import { Server } from "socket.io";
import { verifyToken } from "./services/authService.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Authenticate socket connection
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      console.log("No token provided, disconnecting");
      socket.disconnect();
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log("Invalid token, disconnecting");
      socket.disconnect();
      return;
    }

    // Join user-specific room
    const userRoom = `user:${decoded.userId}`;
    socket.join(userRoom);
    console.log(`User ${decoded.userId} joined room: ${userRoom}`);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => io;

// Emit to specific user
export const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

// Emit to all users (broadcast)
export const emitToAll = (event, data) => {
  if (!io) return;
  io.emit(event, data);
};
