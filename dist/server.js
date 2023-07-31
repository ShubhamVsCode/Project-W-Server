"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const socketController_1 = __importDefault(require("./controller/socketController"));
const app = (0, express_1.default)();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "*",
    },
});
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    credentials: true,
    origin: "*",
}));
app.use((0, cookie_parser_1.default)());
mongoose_1.default.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("Failed to connect to MongoDB", error.message));
app.get("/", (req, res) => {
    return res.send("Server running!");
});
// Web Sockets
io.on("connection", socketController_1.default);
io.on("disconnect", () => {
    console.log("User disconnected");
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ message: err.message });
});
// Start the server
const port = process.env.PORT || 4001;
http.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
