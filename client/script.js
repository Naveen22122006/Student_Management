const API = "http://localhost:5000/api/students";

const form = document.getElementById("studentForm");
const idInput = document.getElementById("studentId");
const name = document.getElementById("name");
const rollNo = document.getElementById("rollNo");
const email = document.getElementById("email");
const course = document.getElementById("course");
const age = document.getElementById("age");

const formTitle = document.getElementById("formTitle");
const formBadge = document.getElementById("formBadge");
const submitText = document.getElementById("submitBtnText");
const cancelBtn = document.getElementById("cancelEditBtn");

const table = document.getElementById("studentTableBody");
const loading = document.getElementById("loadingSpinner");
const empty = document.getElementById("emptyState");
const count = document.getElementById("studentCountBadge");

const search = document.getElementById("searchInput");
const filter = document.getElementById("courseFilter");

const total = document.getElementById("statTotalStudents");
const courses = document.getElementById("statCoursesCount");
const avgAge = document.getElementById("statAvgAge");

const status = document.getElementById("statusText");
const toastBox = document.getElementById("toastContainer");

let students = [];
let editing = false;

// ==========================================
// START
// ==========================================

document.addEventListener("DOMContentLoaded", loadStudents);

form.addEventListener("submit", saveStudent);
cancelBtn.addEventListener("click", resetForm);
search.addEventListener("input", render);
filter.addEventListener("change", render);

// ==========================================
// LOAD STUDENTS
// ==========================================

async function loadStudents() {

    loading.classList.remove("hidden");
    status.textContent = "Connecting...";

    try {

        const res = await fetch(API);
        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(
                data.message || "Server error"
            );
        }

        students = data.data || [];

        status.textContent = "Connected";

        updateStats();
        updateFilter();
        render();

    } catch (err) {

        console.error(err);

        students = [];

        status.textContent = "Connection Error";

        updateStats();
        render();

        showToast(
            "Unable to connect to Student Server",
            "error"
        );

    } finally {

        loading.classList.add("hidden");
    }
}

// ==========================================
// RENDER TABLE
// ==========================================

function render() {

    const text = search.value.toLowerCase().trim();
    const selected = filter.value;

    const list = students.filter(s => {

        const match =
            String(s.name || "").toLowerCase().includes(text) ||
            String(s.rollNo || "").toLowerCase().includes(text) ||
            String(s.email || "").toLowerCase().includes(text) ||
            String(s.course || "").toLowerCase().includes(text);

        const courseMatch =
            selected === "all" ||
            s.course === selected;

        return match && courseMatch;
    });

    table.innerHTML = "";

    count.textContent =
        `${list.length} of ${students.length} records`;

    if (!list.length) {

        empty.classList.remove("hidden");
        return;
    }

    empty.classList.add("hidden");

    list.forEach(s => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${safe(s.rollNo)}</td>
            <td><strong>${safe(s.name)}</strong></td>
            <td>${safe(s.email)}</td>
            <td>${safe(s.course)}</td>
            <td>${safe(s.age)}</td>
            <td>
                <button
                    type="button"
                    class="btn-action edit"
                    onclick="editStudent('${s._id}')">
                    Edit
                </button>

                <button
                    type="button"
                    class="btn-action delete"
                    onclick="deleteStudent('${s._id}')">
                    Delete
                </button>
            </td>
        `;

        table.appendChild(row);
    });
}

// ==========================================
// ADD / UPDATE
// ==========================================

async function saveStudent(e) {

    e.preventDefault();

    const data = {
        name: name.value.trim(),
        rollNo: rollNo.value.trim(),
        email: email.value.trim(),
        course: course.value.trim(),
        age: Number(age.value)
    };

    if (
        !data.name ||
        !data.rollNo ||
        !data.email ||
        !data.course ||
        !data.age
    ) {

        showToast(
            "Please fill all fields",
            "error"
        );

        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {

        showToast(
            "Enter a valid email",
            "error"
        );

        return;
    }

    if (data.age < 1 || data.age > 100) {

        showToast(
            "Age must be between 1 and 100",
            "error"
        );

        return;
    }

    const url = editing
        ? `${API}/${encodeURIComponent(idInput.value)}`
        : API;

    const method = editing ? "PUT" : "POST";

    submitText.textContent =
        editing ? "Updating..." : "Adding...";

    try {

        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok || !result.success) {

            throw new Error(
                result.message || "Operation failed"
            );
        }

        showToast(
            editing
                ? "Student updated successfully"
                : "Student registered successfully",
            "success"
        );

        resetForm();
        await loadStudents();

    } catch (err) {

        console.error(err);

        showToast(
            err.message || "Server error",
            "error"
        );

    } finally {

        submitText.textContent = "Add Student";
    }
}

// ==========================================
// EDIT
// ==========================================

function editStudent(id) {

    const student =
        students.find(s =>
            String(s._id) === String(id)
        );

    if (!student) {

        showToast(
            "Student not found",
            "error"
        );

        return;
    }

    idInput.value = student._id;
    name.value = student.name || "";
    rollNo.value = student.rollNo || "";
    email.value = student.email || "";
    course.value = student.course || "";
    age.value = student.age || "";

    editing = true;

    formTitle.textContent = "Edit Student";
    formBadge.textContent = "Editing";
    formBadge.classList.add("editing");

    submitText.textContent = "Update Student";

    cancelBtn.classList.remove("hidden");

    name.focus();
}

// ==========================================
// DELETE
// ==========================================

async function deleteStudent(id) {

    const student =
        students.find(s =>
            String(s._id) === String(id)
        );

    if (!student) return;

    const yes = confirm(
        `Are you sure you want to delete "${student.name}"?`
    );

    if (!yes) return;

    try {

        const res = await fetch(
            `${API}/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        );

        const data = await res.json();

        if (!res.ok || !data.success) {

            throw new Error(
                data.message || "Delete failed"
            );
        }

        showToast(
            "Student deleted successfully",
            "success"
        );

        if (
            String(idInput.value) === String(id)
        ) {
            resetForm();
        }

        await loadStudents();

    } catch (err) {

        console.error(err);

        showToast(
            err.message || "Delete failed",
            "error"
        );
    }
}

// ==========================================
// RESET
// ==========================================

function resetForm() {

    form.reset();

    idInput.value = "";

    editing = false;

    formTitle.textContent = "Add Student";
    formBadge.textContent = "New";

    formBadge.classList.remove("editing");

    submitText.textContent = "Add Student";

    cancelBtn.classList.add("hidden");
}

// ==========================================
// STATISTICS
// ==========================================

function updateStats() {

    total.textContent = students.length;

    const uniqueCourses = [
        ...new Set(
            students
                .map(s => s.course)
                .filter(Boolean)
        )
    ];

    courses.textContent =
        uniqueCourses.length;

    if (!students.length) {

        avgAge.textContent = "0";
        return;
    }

    const sum = students.reduce(
        (total, s) =>
            total + (Number(s.age) || 0),
        0
    );

    avgAge.textContent =
        (sum / students.length).toFixed(1);
}

// ==========================================
// COURSE FILTER
// ==========================================

function updateFilter() {

    const old = filter.value;

    const list = [
        ...new Set(
            students
                .map(s => s.course)
                .filter(Boolean)
        )
    ].sort();

    filter.innerHTML =
        `<option value="all">All Courses</option>`;

    list.forEach(c => {

        const option =
            document.createElement("option");

        option.value = c;
        option.textContent = c;

        filter.appendChild(option);
    });

    if (list.includes(old)) {
        filter.value = old;
    }
}

// ==========================================
// TOAST
// ==========================================

function showToast(message, type = "info") {

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type}`;

    toast.textContent = message;

    toastBox.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3000);
}

// ==========================================
// SECURITY
// ==========================================

function safe(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ==========================================
// GLOBAL FUNCTIONS
// ==========================================

window.editStudent = editStudent;
window.deleteStudent = deleteStudent;