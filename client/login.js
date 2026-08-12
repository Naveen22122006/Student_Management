// ─── API base ─────────────────────────────────────
const AUTH_API = "http://localhost:5000/api/auth";

// ─── If already logged in, skip to dashboard ──────
(function checkAlreadyLoggedIn() {
    const teacher = sessionStorage.getItem("teacher");
    if (teacher) {
        window.location.href = "index.html";
    }
})();

// ─── Tab switching ─────────────────────────────────
function switchTab(tab) {
    const panels = document.querySelectorAll(".tab-panel");
    const buttons = document.querySelectorAll(".tab-btn");

    panels.forEach(p => p.classList.remove("active"));
    buttons.forEach(b => b.classList.remove("active"));

    document.getElementById("panel" + capitalise(tab)).classList.add("active");
    document.getElementById("tab" + capitalise(tab)).classList.add("active");

    clearAllErrors();
}

function capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

window.switchTab = switchTab;

// ─── Toast
function showToast(message, type = "info") {
    const box = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    box.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ─── Error helpers 
function showError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.add("visible");
}

function clearError(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = "";
    el.classList.remove("visible");
}

function clearAllErrors() {
    document.querySelectorAll(".form-error").forEach(el => {
        el.textContent = "";
        el.classList.remove("visible");
    });
}

// ─── Login Form 
const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const loginBtnText = document.getElementById("loginBtnText");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAllErrors();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    let valid = true;

    if (!email) {
        showError("loginEmailErr", "Email is required");
        valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError("loginEmailErr", "Enter a valid email address");
        valid = false;
    }

    if (!password) {
        showError("loginPasswordErr", "Password is required");
        valid = false;
    }

    if (!valid) return;

    loginBtnText.textContent = "Logging in...";
    loginBtn.disabled = true;

    try {
        const res = await fetch(`${AUTH_API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Login failed");
        }

        // Save teacher info to sessionStorage
        sessionStorage.setItem("teacher", JSON.stringify(data.data));

        showToast(`Welcome back, ${data.data.name}! 🎉`, "success");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 800);

    } catch (err) {
        showToast(err.message || "Login failed. Please try again.", "error");
    } finally {
        loginBtnText.textContent = "Login";
        loginBtn.disabled = false;
    }
});

// ─── Register Form ────────────────────────────────
const registerForm = document.getElementById("registerForm");
const registerBtn = document.getElementById("registerBtn");
const registerBtnText = document.getElementById("registerBtnText");

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAllErrors();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirm = document.getElementById("regConfirm").value;

    let valid = true;

    if (!name) {
        showError("regNameErr", "Full name is required");
        valid = false;
    }

    if (!email) {
        showError("regEmailErr", "Email is required");
        valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError("regEmailErr", "Enter a valid email address");
        valid = false;
    }

    if (!password) {
        showError("regPasswordErr", "Password is required");
        valid = false;
    } else if (password.length < 6) {
        showError("regPasswordErr", "Password must be at least 6 characters");
        valid = false;
    }

    if (!confirm) {
        showError("regConfirmErr", "Please confirm your password");
        valid = false;
    } else if (password !== confirm) {
        showError("regConfirmErr", "Passwords do not match");
        valid = false;
    }

    if (!valid) return;

    registerBtnText.textContent = "Creating account...";
    registerBtn.disabled = true;

    try {
        const res = await fetch(`${AUTH_API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Registration failed");
        }

        showToast("Account created! Please login.", "success");

        registerForm.reset();
        clearAllErrors();

        // Switch to login tab after short delay
        setTimeout(() => switchTab("login"), 1200);

    } catch (err) {
        showToast(err.message || "Registration failed. Please try again.", "error");
    } finally {
        registerBtnText.textContent = "Create Account";
        registerBtn.disabled = false;
    }
});
