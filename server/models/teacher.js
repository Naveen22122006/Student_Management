const mongoose = require("mongoose");

// teacher login info
var teacherSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true
    },

    password: {
        type: String,
        required: [true, "Password is required"]
    }

}, { timestamps: true });

module.exports = mongoose.model("Teacher", teacherSchema);
