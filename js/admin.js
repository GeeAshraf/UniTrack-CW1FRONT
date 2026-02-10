const backendURL = "http://localhost:5000";

async function loadAdminRequests() {
    const table = document.querySelector("#requestsTable tbody");
    const res = await fetch(`http://localhost:5000/requests`, { credentials: "include" });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Cannot fetch requests");

    table.innerHTML = "";
    data.data.forEach(r => {
        table.innerHTML += `
            <tr>
                <td>${r.id}</td>
                <td>${r.title}</td>
                <td>${r.location}</td>
                <td>${r.category}</td>
                <td>${r.priority}</td>
                <td>${r.status}</td>
                <td>${r.technician_id || "-"}</td>
                <td>
                    <button onclick="editRequest(${r.id})" class="btn btn-warning btn-sm">Edit</button>
                    <button onclick="deleteRequest(${r.id})" class="btn btn-danger btn-sm">Delete</button>
                </td>
            </tr>
        `;
    });
}

async function editRequest(id) {
    const newTech = prompt("Enter technician ID to assign:");
    if (!newTech) return;

    const res = await fetch(`http://localhost:5000/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ technician_id: newTech })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Update failed");
    loadAdminRequests();
}

async function deleteRequest(id) {
    if (!confirm("Are you sure you want to delete this request?")) return;

    const res = await fetch(`http://localhost:5000/requests/${id}`, {
        method: "DELETE",
        credentials: "include"
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Delete failed");
    loadAdminRequests();
}

async function checkAdminAuth() {
    const res = await fetch(`http://localhost:5000/me`, { credentials: "include" });
    if (!res.ok) return window.location.href = "login.html";

    const data = await res.json();
    if (data.data.role.toLowerCase() !== "admin") {
        alert("Unauthorized");
        return window.location.href = "login.html";
    }
}

async function logout() {
    await fetch(`http://localhost:5000/auth/logout`, { method: "POST", credentials: "include" });
    window.location.href = "login.html";
}

window.editRequest = editRequest;
window.deleteRequest = deleteRequest;
window.logout = logout;

document.addEventListener("DOMContentLoaded", () => {
    checkAdminAuth();
    loadAdminRequests();
});
