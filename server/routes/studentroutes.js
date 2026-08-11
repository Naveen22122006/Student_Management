const express = require("express");
const router = express.Router();
const Student = require("../models/student");

// GET /api/students - Get all students
router.get("/", async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: students.length,
            data: students,
            source: "MongoDB",
            message: "Students fetched successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch students",
            error: error.message
        });
    }
});

// GET /api/students/:id - Get single student
router.get("/:id", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving student",
            error: error.message
        });
    }
});

// POST /api/students - Create new student
router.post("/", async (req, res) => {
    try {
        const { name, rollNo, email, course, age } = req.body;

        if (!name || !rollNo || !email || !course || !age) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields"
            });
        }

        const trimmedRoll = String(rollNo).trim();

        const existingStudent = await Student.findOne({
            rollNo: trimmedRoll
        });

        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: `Student with Roll Number '${trimmedRoll}' already exists`
            });
        }

        const newStudent = new Student({
            name: name.trim(),
            rollNo: trimmedRoll,
            email: email.trim(),
            course: course.trim(),
            age: Number(age)
        });

        const savedStudent = await newStudent.save();

        res.status(201).json({
            success: true,
            data: savedStudent,
            message: "Student registered successfully"
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to create student"
        });
    }
});

// PUT /api/students/:id - Update student
router.put("/:id", async (req, res) => {
    try {
        const { name, rollNo, email, course, age } = req.body;

        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            {
                name: name?.trim(),
                rollNo: rollNo?.trim(),
                email: email?.trim(),
                course: course?.trim(),
                age: Number(age)
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedStudent) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.json({
            success: true,
            data: updatedStudent,
            message: "Student details updated successfully"
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to update student"
        });
    }
});

// DELETE /api/students/:id - Delete student
router.delete("/:id", async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);

        if (!deletedStudent) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.json({
            success: true,
            data: deletedStudent,
            message: "Student deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete student",
            error: error.message
        });
    }
});

module.exports = router;