const API_BASE_URL = window.env?.API_BASE_URL || "http://localhost:5000";


function $(selector, root = document) {
  const el = root.querySelector(selector);
  if (!el) console.warn(`Selector not found: ${selector}`);
  return el;
}

function showMessage(type, text) {
  const boxId = "signup-message-box";
  let box = document.getElementById(boxId);
  if (!box) {
    box = document.createElement("div");
    box.id = boxId;
    box.style.marginTop = "12px";
    box.style.fontSize = "0.95rem";
    $("#signupForm").appendChild(box);
  }
  box.textContent = text;
  box.style.color = type === "error" ? "#b10000" : (type === "success" ? "#0f7a0c" : "#333");
}

function setLoading(isLoading) {
  const btn = $("#signupBtn") || $("#signupForm button[type='submit']");
  if (!btn) return;
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Creating account..." : "Sign Up";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


document.addEventListener("DOMContentLoaded", () => {
  const form = $("#signupForm");
  if (!form) {
    console.error("signup.js: #signupForm not found.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessage("info", "");
    setLoading(true);

    try {
      const username = $("#username")?.value?.trim() || "";
      const email = $("#email")?.value?.trim() || "";
      const password = $("#password")?.value || "";
      const confirmPassword = $("#confirmPassword")?.value || "";

      if (!username || username.length < 2) {
        showMessage("error", "Please enter a valid username (min 2 characters).");
        return;
      }
      if (!email || !isValidEmail(email)) {
        showMessage("error", "Please enter a valid email address.");
        return;
      }
      if (!password || password.length < 6) {
        showMessage("error", "Password must be at least 6 characters.");
        return;
      }
      if (confirmPassword && password !== confirmPassword) {
        showMessage("error", "Passwords do not match.");
        return;
      }

      const payload = { username, email, password };

      const res = await fetch(`http://localhost:5000/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data?.error || data?.message || `Signup failed (HTTP ${res.status}).`;
        showMessage("error", message);
        return;
      }

  
      showMessage("success", data?.message || "Signup successful! Redirecting to login...");
      setTimeout(() => (window.location.href = "login.html"), 800);

    } catch (err) {
      console.error(err);
      showMessage("error", "Network error. Please make sure the server is running and try again.");
    } finally {
      setLoading(false);
    }
  });
});