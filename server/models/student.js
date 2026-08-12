const mongoose = require("mongoose");

// student fields
var studentSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },

    rollNo: {
        type: String,
        required: [true, "Roll Number is required"],
        unique: true,
        trim: true
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true
    },

    course: {
        type: String,
        required: [true, "Course is required"],
        trim: true
    },

    age: {
        type: Number,
        required: [true, "Age is required"],
        min: [1, "Age must be greater than 0"]
    }

}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
