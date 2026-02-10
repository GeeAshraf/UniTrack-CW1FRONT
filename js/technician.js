const backendURL = "http://localhost:5000";
let currentTechnicianId = null;

function getTechId(r) {
    return r.technician_id ?? r.technicianId ?? r.assigned_to;
}

function getCurrentTechId() {
    return currentTechnicianId;
}

async function loadTechRequests() {
    const table = document.querySelector("#table");
    let requests = [];

    const tryEndpoints = [
        `${backendURL}/requests/assigned`,
        `${backendURL}/requests/technician`,
        `${backendURL}/requests/assigned-to-me`,
        `${backendURL}/requests/my-assigned`
    ];

    for (const url of tryEndpoints) {
        try {
            const res = await fetch(url, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                requests = data.data || data.requests || data || [];
                if (Array.isArray(requests)) break;
            }
        } catch (e) { /* skip failed endpoint */ }
    }

    if (requests.length === 0) {
        const res = await fetch(`${backendURL}/requests`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) return alert(data.error || "Cannot fetch requests");
        const all = data.data || [];
        const myId = getCurrentTechId();
        requests = all.filter(r => {
            const techId = getTechId(r);
            if (!techId) return false;
            return myId && (String(techId) === String(myId) || Number(techId) === Number(myId));
        });
    }

    table.innerHTML = "";
    if (requests.length === 0) {
        table.innerHTML = `<tr><td colspan="7" class="text-muted">No requests assigned to you yet.</td></tr>`;
    } else {
        requests.forEach(r => {
            const status = (r.status || "pending").toLowerCase().replace(/\s/g, "_").replace(/-/g, "_");
            const statusVal = ["pending", "in_progress", "completed"].includes(status) ? status : "pending";
            const reqId = r.id;
            table.innerHTML += `
                <tr>
                    <td>${reqId}</td>
                    <td>${r.title || "-"}</td>
                    <td>${r.location || "-"}</td>
                    <td>${r.priority || "-"}</td>
                    <td>${r.status || "pending"}</td>
                    <td>${r.created_at ? new Date(r.created_at).toLocaleString() : "-"}</td>
                    <td>
                        <select class="form-select form-select-sm status-select" style="min-width:140px" data-request-id="${reqId}">
                            <option value="pending" ${statusVal === "pending" ? "selected" : ""}>Pending</option>
                            <option value="in_progress" ${statusVal === "in_progress" ? "selected" : ""}>In Progress</option>
                            <option value="completed" ${statusVal === "completed" ? "selected" : ""}>Completed</option>
                        </select>
                    </td>
                </tr>
            `;
        });
        table.querySelectorAll(".status-select").forEach(sel => {
            sel.addEventListener("change", function() {
                updateStatus(parseInt(this.dataset.requestId), this.value);
            });
        });
    }
}

async function updateStatus(id, status) {
    const body = { status };
    const res = await fetch(`${backendURL}/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) {
        const msg = data.error || data.message || "Update failed";
        return alert(msg);
    }
    loadTechRequests();
}

async function checkTechAuth() {
    const res = await fetch(`${backendURL}/auth/me`, { credentials: "include" });
    if (!res.ok) {
        window.location.href = "login.html";
        return false;
    }
    const data = await res.json();
    const role = (data?.data?.role || "").toLowerCase();
    if (role !== "technician") {
        alert("Unauthorized. Technician access required.");
        window.location.href = "login.html";
        return false;
    }
    const u = data?.data || data?.user || data;
    currentTechnicianId = u?.id ?? u?.user_id ?? u?.userId;
    return true;
}

async function logout() {
    await fetch(`http://localhost:5000/auth/logout`, { method: "POST", credentials: "include" });
    window.location.href = "login.html";
}

window.updateStatus = updateStatus;
window.logout = logout;

document.addEventListener("DOMContentLoaded", async () => {
    const ok = await checkTechAuth();
    if (!ok) return;
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
    loadTechRequests();
});
