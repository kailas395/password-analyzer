function togglePassword() {
  const input = document.getElementById("password");
  input.type = input.type === "password" ? "text" : "password";
}

let debounceTimer;
let currentRequestId = 0;

function checkPassword() {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    const requestId = ++currentRequestId;

    const password = document.getElementById("password").value;
    const strengthText = document.getElementById("strength");
    const bar = document.getElementById("strength-bar");
    const tips = document.getElementById("tips");

    if (!password) {
      strengthText.textContent = "Enter password first";
      strengthText.style.color = "#ff4d4d";
      bar.style.width = "0%";
      tips.innerHTML = "";
      return;
    }

    strengthText.textContent = "Checking... ⏳";
    strengthText.style.color = "#aaa";

    try {
      const res = await fetch("https://password-analyzer-backend2.onrender.com/check-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });

      if (!res.ok) throw new Error("Server issue");

      const data = await res.json();

      // ❗ Ignore old responses
      if (requestId !== currentRequestId) return;

      strengthText.textContent = `${data.strength} (${data.score}/5)`;

      const width = (data.score / 5) * 100;
      bar.style.width = width + "%";

      if (data.strength === "Weak") {
        strengthText.style.color = "#ff4d4d";
        bar.style.background = "red";
      } else if (data.strength === "Medium") {
        strengthText.style.color = "#ffa500";
        bar.style.background = "orange";
      } else {
        strengthText.style.color = "#00ff99";
        bar.style.background = "limegreen";
      }

      tips.innerHTML = "";

      if (password.length < 8)
        tips.innerHTML += "<li>❌ Use at least 8 characters</li>";

      if (!/[A-Z]/.test(password))
        tips.innerHTML += "<li>❌ Add uppercase letter</li>";

      if (!/[a-z]/.test(password))
        tips.innerHTML += "<li>❌ Add lowercase letter</li>";

      if (!/[0-9]/.test(password))
        tips.innerHTML += "<li>❌ Add numbers</li>";

      if (!/[^A-Za-z0-9]/.test(password))
        tips.innerHTML += "<li>❌ Add special character (!@#$)</li>";

      if (data.reused) {
        tips.innerHTML += "<li>⚠️ Password already used before</li>";
      }

    } catch (error) {
      if (requestId !== currentRequestId) return;

      strengthText.textContent = "Server slow... try again ⏳";
      strengthText.style.color = "#ffa500";
      console.error(error);
    }

  }, 500); // ⏳ Wait 500ms after typing
}