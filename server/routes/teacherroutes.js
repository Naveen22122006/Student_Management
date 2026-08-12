const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const Teacher = require("../models/teacher");

// register a new teacher
router.post("/register", async function(req, res) {
    try {
        var name     = req.body.name;
        var email    = req.body.email;
        var password = req.body.password;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Please fill in all required fields" });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email address" });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        // check if email already used
        var existing = await Teacher.findOne({ email: email.trim().toLowerCase() });
        if (existing) {
            return res.status(400).json({ success: false, message: "An account with this email already exists" });
        }

        // hash password before saving
        var salt    = await bcrypt.genSalt(10);
        var hashed  = await bcrypt.hash(password, salt);

        var teacher = new Teacher({
            name:     name.trim(),
            email:    email.trim().toLowerCase(),
            password: hashed
        });

        await teacher.save();

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                id:    teacher._id,
                name:  teacher.name,
                email: teacher.email
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message || "Registration failed" });
    }
});

// login a teacher
router.post("/login", async function(req, res) {
    try {
        var email    = req.body.email;
        var password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        // find teacher by email
        var teacher = await Teacher.findOne({ email: email.trim().toLowerCase() });
        if (!teacher) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // compare password with stored hash
        var isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        res.json({
            success: true,
            message: "Login successful",
            data: {
                id:    teacher._id,
                name:  teacher.name,
                email: teacher.email
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message || "Login failed" });
    }
});

module.exports = router;
