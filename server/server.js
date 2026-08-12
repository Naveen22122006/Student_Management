const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const dotenv   = require("dotenv");
const path     = require("path");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

var PORT      = process.env.PORT || 5000;
var MONGO_URI = process.env.MONGO_URI || process.env.mongoURI;

// serve the client folder as static files
app.use(express.static(path.join(__dirname, "../client")));

// connect to mongodb
async function connectDB() {
    if (!MONGO_URI) {
        console.error("MONGO_URI missing from .env");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
        process.exit(1);
    }
}

// simple health check
app.get("/api/health", function(req, res) {
    var dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    res.json({
        status: "OK",
        message: "Student Management API is running",
        dbState: dbStatus
    });
});

const studentRoutes = require("./routes/studentroutes");
app.use("/api/students", studentRoutes);

const teacherRoutes = require("./routes/teacherroutes");
app.use("/api/auth", teacherRoutes);

// start server after db connects
connectDB().then(function() {
    app.listen(PORT, function() {
        console.log("Server running on http://localhost:" + PORT);
    });
});