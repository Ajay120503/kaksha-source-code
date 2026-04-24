// require("dotenv").config();
// const http = require("http");

// const app = require("./src/app");
// const connectDB = require("./src/config/db");

// connectDB();

// // HTTP Server
// const server = http.createServer(app);


// // SERVER START
// const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const app = require("./src/app");
const connectDB = require("./src/config/db");
const setupSocket = require("./src/socket");

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", process.env.FRONTEND_URL],
    credentials: true,
  },
});

setupSocket(io);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});