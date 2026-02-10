const backendURL = "http://localhost:5000";

async function login(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`http://localhost:5000/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Login failed");

    const role = data.data.role.toLowerCase();

    if (role === "admin") window.location.href = "admin.html";
    else if (role === "technician") window.location.href = "technician.html";
    else if (role === "user" || role === "staff" || role === "student") window.location.href = "user.html";
    else alert("Unknown role");
}

async function signup(e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value.toLowerCase();

    if (!role) return alert("Please choose a role");

    const res = await fetch(`http://localhost:5000/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Signup failed");

    alert("Signup successful! Please login.");
    window.location.href = "login.html";
}

async function checkAuth(expectedRole = null) {
    const res = await fetch(`http://localhost:5000/me`, { credentials: "include" });
    if (!res.ok) return window.location.href = "login.html";

    const user = await res.json();
    if (expectedRole && user.data.role.toLowerCase() !== expectedRole.toLowerCase()) {
        alert("Unauthorized access");
        return window.location.href = "login.html";
    }
    return user;
}

async function logout() {
    await fetch(`http://localhost:5000/auth/logout`, { method: "POST", credentials: "include" });
    window.location.href = "login.html";
}

window.login = login;
window.signup = signup;
window.checkAuth = checkAuth;
window.logout = logout;
