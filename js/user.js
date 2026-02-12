const backendURL = "http://localhost:5000";

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    if (token) {
        return { "Authorization": "Bearer " + token, "Content-Type": "application/json" };
    }
    return { "Content-Type": "application/json" };
}

async function loadUserRequests() {
    const table = document.getElementById("requestsTable");

    const res = await fetch(`${backendURL}/requests/my`, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
        if (res.status === 401) {
            alert("You are not logged in. Please log in again.");
            return (window.location.href = "login.html");
        }
        return alert(data.error || "Failed to load requests");
    }

    table.innerHTML = "";
    (data.data || []).forEach(r => {
        table.innerHTML += `
            <tr>
                <td>${r.id}</td>
                <td>${r.title}</td>
                <td>${r.status || "pending"} ⏳</td>
                <td>${new Date(r.created_at).toLocaleString()}</td>
            </tr>
        `;
    });
}

async function createRequest(e) {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const location = document.getElementById("location").value;
    const priority = document.getElementById("priority").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("desc").value;

    const res = await fetch(`${backendURL}/requests`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ title, location, priority, category, description })
    });

    const data = await res.json();

    if (!res.ok) {
        if (res.status === 401) {
            alert("You are not logged in. Please log in again.");
            return (window.location.href = "login.html");
        }
        return alert(data.error || "Request creation failed");
    }

    document.getElementById("reqForm").reset();
    loadUserRequests();
}

async function logout() {
    await fetch(`${backendURL}/auth/logout`, { method: "POST", credentials: "include" });
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("reqForm")) {
        document.getElementById("reqForm").addEventListener("submit", createRequest);
    }
    if (document.getElementById("requestsTable")) {
        loadUserRequests();
    }
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
});