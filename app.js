const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const session = require('express-session');  // For authentication

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set view engine to EJS
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple session-based authentication middleware
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));

// Route for the homepage (map view)
app.get("/", (req, res) => {
    res.render("index");
});

// Route for the dashboard (for logged-in users)
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');  // Redirect to home if not authenticated
    }

    const user = req.session.user;  // Access user from session
    res.render('dashboard', { user });  // Pass the user object to the view
});

// Route for login (for simplicity, we'll have a dummy login)
app.get("/login", (req, res) => {
    res.render("login");
});

// Handle login POST
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "admin") {
        req.session.user = { username };
        res.redirect("/dashboard");
    } else {
        res.send("Invalid credentials");
    }
});

// Socket.IO for real-time communication
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Example: Send bus location to the client
    setInterval(() => {
        const locationData = {
            id: socket.id,
            latitude: 40.7128 + (Math.random() - 0.5) * 0.01,  // Random location around New York City (example)
            longitude: -74.0060 + (Math.random() - 0.5) * 0.01,
            locationName: "Bus Location " + socket.id,
        };
        socket.emit("receive-location", locationData);
    }, 5000);  // Send location every 5 seconds

    // Handle sending location data
    socket.on("send-location", (data) => {
        console.log(`Location received from ${socket.id}:`, data);
        io.emit("receive-location", { id: socket.id, ...data });
    });

    // Handle disconnecting users
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        io.emit("user-disconnected", { id: socket.id });
    });
});

// Start the server
server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
