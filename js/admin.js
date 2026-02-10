const backendURL = window.env?.API_BASE_URL || "http://localhost:5000";

let techniciansList = [];
let editRequestId = null;

async function loadTechnicians() {
    try {
        // Try /technicians first
        let res = await fetch(`${backendURL}/technicians`, { credentials: "include" });

        // Fallback to /users?role=technician
        if (!res.ok) {
            res = await fetch(`${backendURL}/users?role=technician`, { credentials: "include" });
        }
        // Final fallback to /users
        if (!res.ok) {
            res = await fetch(`${backendURL}/users`, { credentials: "include" });
        }

        const data = await res.json().catch(() => ({}));
        const users = data.data || data.users || data || [];

        techniciansList = Array.isArray(users)
            ? users.filter(u => (u.role || "").toLowerCase().includes("tech"))
            : [];

        if (techniciansList.length === 0 && Array.isArray(users)) {
            techniciansList = users;
        }
    } catch (e) {
        console.error("loadTechnicians error:", e);
        techniciansList = [];
    }
}

async function loadAdminRequests() {
    const table = document.querySelector("#requestsTable");

    const res = await fetch(`${backendURL}/requests`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        alert(data.error || "Cannot fetch requests");
        return;
    }

    const requests = data.data || [];

    table.innerHTML = "";
    requests.forEach(r => {
        table.innerHTML += `
            <tr>
                <td>${r.id}</td>
                <td>${r.title}</td>
                <td>${r.location}</td>
                <td>${r.category}</td>
                <td>${r.priority}</td>
                <td>${r.status}</td>
                <td>${r.technician?.name || r.technician_name || (r.technician_id ? `Tech #${r.technician_id}` : "-")}</td>
                <td>
                    <button onclick="editRequest(${r.id})" class="btn btn-warning btn-sm">Assign</button>
                    <button onclick="deleteRequest(${r.id})" class="btn btn-danger btn-sm">Delete</button>
                </td>
            </tr>
        `;
    });
}

async function editRequest(id) {
    editRequestId = id;

    const select = document.getElementById("technicianSelect");
    const manualInput = document.getElementById("technicianIdManual");

    if (manualInput) manualInput.value = "";

    select.innerHTML = '<option value="">-- Choose a technician --</option>';

    techniciansList.forEach(t => {
        const name = t.name || t.username || t.email || `User #${t.id}`;
        select.innerHTML += `<option value="${t.id}">${name}</option>`;
    });

    const modal = new bootstrap.Modal(document.getElementById("assignTechModal"));
    modal.show();
}

async function doAssignTechnician(requestId, techId) {
    const body = JSON.stringify({ technicianId: Number(techId) });

    try {
        // Try PATCH /requests/:id first (primary API)
        let res = await fetch(`${backendURL}/requests/${requestId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body
        });

        // If some environments still respond differently, fall back to PUT
        if (res.status === 404) {
            console.warn("PATCH /requests/:id returned 404, retrying with PUT");
            res = await fetch(`${backendURL}/requests/${requestId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body
            });
        }

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            console.error("Assign technician failed:", res.status, data);
            throw new Error(data.error || data.message || `Assign failed (${res.status})`);
        }

        await loadAdminRequests();
    } catch (err) {
        console.error("Network/assign error:", err);
        throw err;
    }
}

async function confirmAssignTechnician() {
    const techId =
        document.getElementById("technicianSelect")?.value?.trim() ||
        document.getElementById("technicianIdManual")?.value?.trim();

    if (!techId || !editRequestId) {
        alert("Please select a technician or enter an ID.");
        return;
    }

    try {
        await doAssignTechnician(editRequestId, techId);
        bootstrap.Modal.getInstance(document.getElementById("assignTechModal"))?.hide();
        editRequestId = null;
    } catch (err) {
        alert(err.message || "Assign failed.");
    }
}

async function deleteRequest(id) {
    if (!confirm("Are you sure you want to delete this request?")) return;

    const res = await fetch(`${backendURL}/requests/${id}`, {
        method: "DELETE",
        credentials: "include"
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        alert(data.error || "Delete failed");
        return;
    }

    await loadAdminRequests();
}

async function checkAdminAuth() {
    const res = await fetch(`${backendURL}/auth/me`, { credentials: "include" });

    if (!res.ok) {
        window.location.href = "login.html";
        return false;
    }

    const data = await res.json().catch(() => ({}));
    const role = (data?.data?.role || "").toLowerCase();

    if (role !== "admin") {
        alert("Unauthorized. Admin access required.");
        window.location.href = "login.html";
        return false;
    }

    return true;
}

async function logout() {
    await fetch(`${backendURL}/auth/logout`, {
        method: "POST",
        credentials: "include"
    });
    window.location.href = "login.html";
}

window.editRequest = editRequest;
window.deleteRequest = deleteRequest;
window.confirmAssignTechnician = confirmAssignTechnician;
window.logout = logout;

document.addEventListener("DOMContentLoaded", async () => {
    const ok = await checkAdminAuth();
    if (!ok) return;

    document.getElementById("logoutBtn")?.addEventListener("click", logout);
    document.getElementById("assignTechBtn")?.addEventListener("click", confirmAssignTechnician);

    await loadTechnicians();
    loadAdminRequests();
});