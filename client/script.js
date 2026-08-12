var API_URL = "http://localhost:5000/api/students";

// get all the dom elements
var form = document.getElementById("studentForm");
var idField = document.getElementById("studentId");
var nameField = document.getElementById("name");
var rollField = document.getElementById("rollNo");
var emailField = document.getElementById("email");
var courseField = document.getElementById("course");
var ageField = document.getElementById("age");

var formTitle = document.getElementById("formTitle");
var formBadge = document.getElementById("formBadge");
var submitText = document.getElementById("submitBtnText");
var cancelBtn = document.getElementById("cancelEditBtn");

var tableBody = document.getElementById("studentTableBody");
var loadingDiv = document.getElementById("loadingSpinner");
var emptyDiv = document.getElementById("emptyState");
var countBadge = document.getElementById("studentCountBadge");

var searchBox = document.getElementById("searchInput");
var courseFilter = document.getElementById("courseFilter");

var totalStat = document.getElementById("statTotalStudents");
var coursesStat = document.getElementById("statCoursesCount");
var ageStat = document.getElementById("statAvgAge");

var statusText = document.getElementById("statusText");
var toastBox = document.getElementById("toastContainer");

var students = [];
var isEditing = false;

// when page loads show teacher name and load students
document.addEventListener("DOMContentLoaded", function () {
    try {
        var teacherInfo = JSON.parse(sessionStorage.getItem("teacher") || "{}");
        var nameEl = document.getElementById("teacherName");
        if (nameEl && teacherInfo.name) {
            nameEl.textContent = "👤 " + teacherInfo.name;
        }
    } catch (e) { }

    loadStudents();
});

form.addEventListener("submit", saveStudent);
cancelBtn.addEventListener("click", resetForm);
searchBox.addEventListener("input", renderTable);
courseFilter.addEventListener("change", renderTable);

// get all students from server
async function loadStudents() {
    loadingDiv.classList.remove("hidden");
    statusText.textContent = "Connecting...";

    try {
        var res = await fetch(API_URL);
        var data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Server error");
        }

        students = data.data || [];
        statusText.textContent = "Connected";

        updateStats();
        updateFilter();
        renderTable();

    } catch (err) {
        console.error(err);
        students = [];
        statusText.textContent = "Connection Error";
        updateStats();
        renderTable();
        showToast("Unable to connect to Student Server", "error");

    } finally {
        loadingDiv.classList.add("hidden");
    }
}

// show students in table
function renderTable() {
    var searchVal = searchBox.value.toLowerCase().trim();
    var filterVal = courseFilter.value;

    var filtered = students.filter(function (s) {
        var matchText =
            String(s.name || "").toLowerCase().includes(searchVal) ||
            String(s.rollNo || "").toLowerCase().includes(searchVal) ||
            String(s.email || "").toLowerCase().includes(searchVal) ||
            String(s.course || "").toLowerCase().includes(searchVal);

        var matchCourse = filterVal === "all" || s.course === filterVal;
        return matchText && matchCourse;
    });

    tableBody.innerHTML = "";
    countBadge.textContent = filtered.length + " of " + students.length + " records";

    if (filtered.length === 0) {
        emptyDiv.classList.remove("hidden");
        return;
    }

    emptyDiv.classList.add("hidden");

    for (var i = 0; i < filtered.length; i++) {
        var s = filtered[i];
        var row = document.createElement("tr");

        row.innerHTML =
            "<td>" + safe(s.rollNo) + "</td>" +
            "<td><strong>" + safe(s.name) + "</strong></td>" +
            "<td>" + safe(s.email) + "</td>" +
            "<td>" + safe(s.course) + "</td>" +
            "<td>" + safe(s.age) + "</td>" +
            "<td>" +
            "<button type='button' class='btn-action edit' onclick=\"editStudent('" + s._id + "')\">Edit</button> " +
            "<button type='button' class='btn-action delete' onclick=\"deleteStudent('" + s._id + "')\">Delete</button>" +
            "</td>";

        tableBody.appendChild(row);
    }
}

// add new student or update existing
async function saveStudent(e) {
    e.preventDefault();

    var info = {
        name: nameField.value.trim(),
        rollNo: rollField.value.trim(),
        email: emailField.value.trim(),
        course: courseField.value.trim(),
        age: Number(ageField.value)
    };

    if (!info.name || !info.rollNo || !info.email || !info.course || !info.age) {
        showToast("Please fill all fields", "error");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) {
        showToast("Enter a valid email", "error");
        return;
    }

    if (info.age < 1 || info.age > 100) {
        showToast("Age must be between 1 and 100", "error");
        return;
    }

    var url = isEditing ? API_URL + "/" + encodeURIComponent(idField.value) : API_URL;
    var method = isEditing ? "PUT" : "POST";

    submitText.textContent = isEditing ? "Updating..." : "Adding...";

    try {
        var res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(info)
        });

        var result = await res.json();

        if (!res.ok || !result.success) {
            throw new Error(result.message || "Operation failed");
        }

        showToast(isEditing ? "Student updated successfully" : "Student registered successfully", "success");
        resetForm();
        await loadStudents();

    } catch (err) {
        console.error(err);
        showToast(err.message || "Server error", "error");
    } finally {
        submitText.textContent = "Add Student";
    }
}

// fill form with student data to edit
function editStudent(id) {
    var student = null;
    for (var i = 0; i < students.length; i++) {
        if (String(students[i]._id) === String(id)) {
            student = students[i];
            break;
        }
    }

    if (!student) {
        showToast("Student not found", "error");
        return;
    }

    idField.value = student._id;
    nameField.value = student.name || "";
    rollField.value = student.rollNo || "";
    emailField.value = student.email || "";
    courseField.value = student.course || "";
    ageField.value = student.age || "";

    isEditing = true;

    formTitle.textContent = "Edit Student";
    formBadge.textContent = "Editing";
    formBadge.classList.add("editing");
    submitText.textContent = "Update Student";
    cancelBtn.classList.remove("hidden");

    nameField.focus();
}

// delete a student
async function deleteStudent(id) {
    var student = null;
    for (var i = 0; i < students.length; i++) {
        if (String(students[i]._id) === String(id)) {
            student = students[i];
            break;
        }
    }

    if (!student) return;

    var yes = confirm('Are you sure you want to delete "' + student.name + '"?');
    if (!yes) return;

    try {
        var res = await fetch(API_URL + "/" + encodeURIComponent(id), { method: "DELETE" });
        var data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Delete failed");
        }

        showToast("Student deleted successfully", "success");

        if (String(idField.value) === String(id)) {
            resetForm();
        }

        await loadStudents();

    } catch (err) {
        console.error(err);
        showToast(err.message || "Delete failed", "error");
    }
}

// reset form back to add mode
function resetForm() {
    form.reset();
    idField.value = "";
    isEditing = false;

    formTitle.textContent = "Add Student";
    formBadge.textContent = "New";
    formBadge.classList.remove("editing");
    submitText.textContent = "Add Student";
    cancelBtn.classList.add("hidden");
}

// update numbers at top
function updateStats() {
    totalStat.textContent = students.length;

    var courseList = [];
    for (var i = 0; i < students.length; i++) {
        var c = students[i].course;
        if (c && courseList.indexOf(c) === -1) {
            courseList.push(c);
        }
    }
    coursesStat.textContent = courseList.length;

    if (students.length === 0) {
        ageStat.textContent = "0";
        return;
    }

    var total = 0;
    for (var i = 0; i < students.length; i++) {
        total += Number(students[i].age) || 0;
    }
    ageStat.textContent = (total / students.length).toFixed(1);
}

// update course dropdown
function updateFilter() {
    var prevVal = courseFilter.value;
    var courseList = [];

    for (var i = 0; i < students.length; i++) {
        var c = students[i].course;
        if (c && courseList.indexOf(c) === -1) {
            courseList.push(c);
        }
    }
    courseList.sort();

    courseFilter.innerHTML = '<option value="all">All Courses</option>';

    for (var i = 0; i < courseList.length; i++) {
        var opt = document.createElement("option");
        opt.value = courseList[i];
        opt.textContent = courseList[i];
        courseFilter.appendChild(opt);
    }

    if (courseList.indexOf(prevVal) !== -1) {
        courseFilter.value = prevVal;
    }
}

// show small popup
function showToast(msg, type) {
    var toast = document.createElement("div");
    toast.className = "toast " + (type || "info");
    toast.textContent = msg;
    toastBox.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3000);
}

// escape html so no XSS
function safe(val) {
    return String(val == null ? "" : val)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// logout
function logoutTeacher() {
    var yes = confirm("Are you sure you want to logout?");
    if (!yes) return;
    sessionStorage.removeItem("teacher");
    window.location.href = "login.html";
}

// need these for onclick in html
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.logoutTeacher = logoutTeacher;