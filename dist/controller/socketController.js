"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const roomUsers = new Map();
// Helper function to get the recipient socket ID for WebRTC signaling
function getRecipientSocketId(senderSocketId) {
    for (const [roomId, sockets] of roomUsers.entries()) {
        if (sockets.size > 1 && sockets.has(senderSocketId)) {
            return [...sockets].find((socketId) => socketId !== senderSocketId);
        }
    }
    return null;
}
const socketController = (socket) => {
    socket.on("join-room", ({ roomId, name }) => {
        socket.join(roomId);
        // Store the socket ID of the user in the roomUsers map
        if (!roomUsers.has(roomId)) {
            roomUsers.set(roomId, new Set());
        }
        roomUsers.get(roomId).add({ socketId: socket.id, user: name });
        socket.to(roomId).emit("user-joined", { roomId, name });
        socket.on("message-sent", (currentMessage) => {
            console.log(currentMessage);
            socket.to(roomId).emit("message-received", currentMessage);
        });
    });
    socket.on("call-user", ({ roomId: callRoomId, name: callerName }) => {
        const recipientId = getRecipientSocketId(socket.id);
        if (recipientId) {
            socket.to(recipientId).emit("call-made", {
                roomId: callRoomId,
                name: callerName,
            });
        }
        else {
            // Handle the case when no recipient was found (e.g., log the error)
            console.log("No recipient found for call invitation.");
            // You can also notify the sender, for example:
            socket.emit("call-error", "No recipient found for call invitation.");
        }
    });
    socket.on("webrtc-signal", (data) => {
        // Send the signaling data to the appropriate recipient
        console.log("Singal from WebRTC");
        const recipientId = getRecipientSocketId(socket.id);
        console.log("Recipient Id ", recipientId);
        if (recipientId) {
            console.log("Recipient Id Signal Transfered", recipientId);
            socket.to(recipientId).emit("webrtc-signal", data);
        }
        else {
            // Handle the case when no recipient was found (e.g., log the error)
            console.log("No recipient found for WebRTC signaling.");
            // You can also notify the sender, for example:
            socket.emit("webrtc-error", "No recipient found for WebRTC signaling.");
        }
    });
    socket.on("disconnect", () => {
        console.log("User disconnected: " + socket.id);
        // Remove the socket ID from the roomUsers map
        for (const [roomId, sockets] of roomUsers.entries()) {
            if (sockets.has(socket.id)) {
                sockets.delete(socket.id);
                // Notify other users in the room that a user has left
                socket.to(roomId).emit("user-left", { userId: socket.id });
                break;
            }
        }
    });
};
exports.default = socketController;
