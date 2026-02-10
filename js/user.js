const backendURL = window.env?.API_BASE_URL || "http://localhost:5000";

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    if (token) {
        return { "Authorization": "Bearer " + token, "Content-Type": "application/json" };
    }
    return { "Content-Type": "application/json" };
}

// Load logged-in user's own requests
async function loadUserRequests() {
    const table = document.getElementById("requestsTable");

    try {
        const res = await fetch(`${backendURL}/requests`, {
            method: "GET",
            headers: getAuthHeaders(),
            credentials: "include"
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            if (res.status === 401) {
                alert("You are not logged in. Please log in again.");
                return (window.location.href = "login.html");
            }
            return alert(data.error || data.message || "Failed to load requests");
        }

        const requests = data.data || data.requests || [];

        table.innerHTML = "";
        requests.forEach(r => {
            table.innerHTML += `
                <tr>
                    <td>${r.id}</td>
                    <td>${r.title}</td>
                    <td>${r.priority || "-"}</td>
                    <td>${r.status || "pending"} ⏳</td>
                    <td>${r.created_at ? new Date(r.created_at).toLocaleString() : "-"}</td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Failed to load user requests:", err);
        alert("Could not connect to the server to load your requests. Please try again.");
    }
}

// Create a new request
async function createRequest(e) {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const location = document.getElementById("location").value;
    const priority = document.getElementById("priority").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("desc").value;

    try {
        const res = await fetch(`${backendURL}/requests`, {
            method: "POST",
            headers: getAuthHeaders(),
            credentials: "include",
            body: JSON.stringify({ title, location, priority, category, description })
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            if (res.status === 401) {
                alert("You are not logged in. Please log in again.");
                return (window.location.href = "login.html");
            }
            return alert(data.error || data.message || "Request creation failed");
        }

        document.getElementById("reqForm").reset();
        loadUserRequests();
    } catch (err) {
        console.error("Failed to create request:", err);
        alert("Could not connect to the server to submit your request. Please try again.");
    }
}

async function logout() {
    await fetch(`${backendURL}/auth/logout`, { method: "POST", credentials: "include" });
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

// Run on page load
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("reqForm")) {
        document.getElementById("reqForm").addEventListener("submit", createRequest);
    }
    if (document.getElementById("requestsTable")) {
        loadUserRequests();
    }
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
});