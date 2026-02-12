
const API_BASE_URL = window.env?.API_BASE_URL || "http://localhost:5000";


function $(selector, root = document) {
  const el = root.querySelector(selector);
  if (!el) console.warn(`Selector not found: ${selector}`);
  return el;
}

function showMessage(type, text) {
  const boxId = "login-message-box";
  let box = document.getElementById(boxId);
  if (!box) {
    box = document.createElement("div");
    box.id = boxId;
    box.style.marginTop = "12px";
    box.style.fontSize = "0.95rem";
    $("#loginForm").appendChild(box);
  }
  box.textContent = text;
  box.style.color =
    type === "error" ? "#b10000" :
    type === "success" ? "#0f7a0c" :
    "#333";
}

function setLoading(isLoading) {
  const btn = $("#loginBtn") || $("#loginForm button[type='submit']");
  if (!btn) return;
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Signing in..." : "Login";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Role-based redirect
function redirectByRole(user) {
  const role = user?.role?.toLowerCase?.() || "";
  if (role.includes("admin")) {
    window.location.href = "admin.html";
  } else if (role.includes("tech")) {
    window.location.href = "technician.html";
  } else {
    window.location.href = "user.html";
  }
}
//Login Submit Handler
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  if (!form) {
    console.error("login.js: #loginForm not found.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessage("info", "");
    setLoading(true);

    try {
      const email = $("#email")?.value?.trim() || "";
      const password = $("#password")?.value || "";

      if (!email || !isValidEmail(email)) {
        showMessage("error", "Please enter a valid email address.");
        setLoading(false);
        return;
      }
      if (!password || password.length < 6) {
        showMessage("error", "Password must be at least 6 characters.");
        setLoading(false);
        return;
      }

      const payload = { email, password };

      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          data?.error ||
          data?.message ||
          `Login failed (HTTP ${res.status}).`;
        showMessage("error", message);
        setLoading(false);
        return;
      }

      const user = data?.data;

      if (!user) {
        showMessage("error", "Login failed: invalid server response.");
        setLoading(false);
        return;
      }

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      showMessage("success", data?.message || "Login successful!");
      redirectByRole(user);
    } catch (err) {
      console.error(err);
      showMessage(
        "error",
        "Network error. Please make sure the server is running and try again."
      );
    } finally {
      setLoading(false);
    }
  });
});

