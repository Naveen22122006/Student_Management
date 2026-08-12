const express = require("express");
const router  = express.Router();
const Student = require("../models/student");

// get all students
router.get("/", async function(req, res) {
    try {
        var list = await Student.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            count: list.length,
            data: list,
            source: "MongoDB",
            message: "Students fetched successfully"
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch students", error: err.message });
    }
});

// get one student by id
router.get("/:id", async function(req, res) {
    try {
        var student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }
        res.json({ success: true, data: student });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error retrieving student", error: err.message });
    }
});

// add a new student
router.post("/", async function(req, res) {
    try {
        var name   = req.body.name;
        var rollNo = req.body.rollNo;
        var email  = req.body.email;
        var course = req.body.course;
        var age    = req.body.age;

        if (!name || !rollNo || !email || !course || !age) {
            return res.status(400).json({ success: false, message: "Please fill in all required fields" });
        }

        var rollNum = String(rollNo).trim();

        // check if roll number already exists
        var existing = await Student.findOne({ rollNo: rollNum });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Student with Roll Number '" + rollNum + "' already exists"
            });
        }

        var newStudent = new Student({
            name:   name.trim(),
            rollNo: rollNum,
            email:  email.trim(),
            course: course.trim(),
            age:    Number(age)
        });

        var saved = await newStudent.save();
        res.status(201).json({ success: true, data: saved, message: "Student registered successfully" });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message || "Failed to create student" });
    }
});

// update student details
router.put("/:id", async function(req, res) {
    try {
        var name   = req.body.name;
        var rollNo = req.body.rollNo;
        var email  = req.body.email;
        var course = req.body.course;
        var age    = req.body.age;

        var updated = await Student.findByIdAndUpdate(
            req.params.id,
            {
                name:   name   ? name.trim()   : name,
                rollNo: rollNo ? rollNo.trim() : rollNo,
                email:  email  ? email.trim()  : email,
                course: course ? course.trim() : course,
                age:    Number(age)
            },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        res.json({ success: true, data: updated, message: "Student details updated successfully" });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message || "Failed to update student" });
    }
});

// delete a student
router.delete("/:id", async function(req, res) {
    try {
        var deleted = await Student.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }
        res.json({ success: true, data: deleted, message: "Student deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to delete student", error: err.message });
    }
});

module.exports = router;