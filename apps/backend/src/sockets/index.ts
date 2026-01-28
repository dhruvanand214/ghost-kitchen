import { Server, Socket } from "socket.io";

export const setupSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("JOIN_KITCHEN", (kitchenId: string) => {
      socket.join(kitchenId);
      console.log(`Socket ${socket.id} joined kitchen ${kitchenId}`);
    });

    socket.on("JOIN_ORDER", (orderId: string) => {
      socket.join(orderId);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};
