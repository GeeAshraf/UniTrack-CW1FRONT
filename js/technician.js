const backendURL = "http://localhost:5000";

async function loadTechRequests() {
    const table = document.querySelector("#requestsTable");
    const res = await fetch(`http://localhost:5000/requests`, { credentials: "include" });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Cannot fetch requests");

    table.innerHTML = "";
    data.data.forEach(r => {
        if (r.technician_id) {
            table.innerHTML += `
                <tr>
                    <td>${r.id}</td>
                    <td>${r.title}</td>
                    <td>${r.location}</td>
                    <td>${r.priority}</td>
                    <td>${r.status || ""}</td>
                    <td>${new Date(r.created_at).toLocaleString()}</td>
                    <td>
                        <button onclick="updateStatus(${r.id}, 'pending')" class="btn btn-secondary btn-sm">⏳</button>
                        <button onclick="updateStatus(${r.id}, 'in_progress')" class="btn btn-warning btn-sm">🟡</button>
                        <button onclick="updateStatus(${r.id}, 'completed')" class="btn btn-success btn-sm">✅</button>
                    </td>
                </tr>
            `;
        }
    });
}

async function updateStatus(id, status) {
    const res = await fetch(`http://localhost:5000/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Update failed");
    loadTechRequests();
}

async function checkTechAuth() {
    const res = await fetch(`http://localhost:5000/me`, { credentials: "include" });
    if (!res.ok) return window.location.href = "login.html";

    const data = await res.json();
    if (data.data.role.toLowerCase() !== "technician") {
        alert("Unauthorized");
        return window.location.href = "login.html";
    }
}

async function logout() {
    await fetch(`http://localhost:5000/auth/logout`, { method: "POST", credentials: "include" });
    window.location.href = "login.html";
}

window.updateStatus = updateStatus;
window.logout = logout;

document.addEventListener("DOMContentLoaded", () => {
    checkTechAuth();
    loadTechRequests();
});
