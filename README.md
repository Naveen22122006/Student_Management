# Student Management System

A web-based application for teachers to manage student records. Teachers must log in before accessing the dashboard. All data is stored in MongoDB Atlas.

---

## Features

- **Teacher Auth** — Register and login with hashed passwords
- **Add Students** — Save name, roll number, email, course and age
- **Edit / Delete** — Update or remove any student record
- **Search** — Find students by name, roll number, email or course
- **Filter by Course** — Narrow down the list using the course dropdown
- **Stats** — See total students, unique courses, and average age at a glance
- **Auth Guard** — Dashboard is blocked unless teacher is logged in
- **Logout** — Clears session and redirects back to login

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Auth | bcryptjs (password hashing), sessionStorage |

---

## Project Structure

```
student/
├── client/
│   ├── index.html         # student dashboard
│   ├── login.html         # login & register page
│   ├── script.js          # dashboard logic (CRUD, search, stats)
│   ├── login.js           # login / register logic
│   ├── style.css          # dashboard styles
│   └── login.css          # login page styles
└── server/
    ├── server.js          # app entry point
    ├── .env               # environment variables
    ├── models/
    │   ├── student.js     # student mongoose schema
    │   └── teacher.js     # teacher mongoose schema
    └── routes/
        ├── studentroutes.js    # student CRUD API
        └── teacherroutes.js    # register & login API
```

---


