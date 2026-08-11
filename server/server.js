const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(express.static(path.join(__dirname, "../client")));

async function connectDatabase() {
    if (!MONGO_URI) {
        console.error("MONGO_URI is missing from .env");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });

        console.log("MongoDB Atlas connected successfully");
    } catch (error) {
        console.error("MongoDB Atlas connection failed:");
        console.error(error.message);
        process.exit(1);
    }
}

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Student Management API is running",
        dbState: mongoose.connection.readyState === 1
            ? "Connected"
            : "Disconnected"
    });
});

const studentRoutes = require("./routes/studentroutes");
app.use("/api/students", studentRoutes);

connectDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});