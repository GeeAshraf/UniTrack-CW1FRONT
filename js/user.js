const backendURL = "http://localhost:5000";

async function loadUserRequests() {
    const table = document.getElementById("requestsTable");
    const res = await fetch(`http://localhost:5000/requests/my`, { credentials: "include" });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed to load requests");

    table.innerHTML = "";
    data.data.forEach(r => {
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

    const res = await fetch(`http://localhost:5000/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, location, priority, category, description })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Request creation failed");

    document.getElementById("reqForm").reset();
    loadUserRequests();
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("reqForm")) {
        document.getElementById("reqForm").addEventListener("submit", createRequest);
    }
    if (document.getElementById("requestsTable")) {
        loadUserRequests();
    }
});
