function togglePassword() {
  const input = document.getElementById("password");
  input.type = input.type === "password" ? "text" : "password";
}

let retryTimeout = null;

async function checkPassword() {
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

  // Clear previous retry
  if (retryTimeout) clearTimeout(retryTimeout);

  strengthText.textContent = "Connecting to server... ⏳";
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

    // Strength text
    strengthText.textContent = `${data.strength} (${data.score}/5)`;

    // Color + bar
    const width = (data.score / 5) * 100;
    bar.style.width = width + "%";

    if (data.strength === "Weak") {
      strengthText.style.color = "#ff4d4d";
      bar.style.background = "linear-gradient(90deg, #ff4d4d, #ff0000)";
    } else if (data.strength === "Medium") {
      strengthText.style.color = "#ffa500";
      bar.style.background = "linear-gradient(90deg, #ffa500, #ffcc00)";
    } else {
      strengthText.style.color = "#00ff99";
      bar.style.background = "linear-gradient(90deg, #00ff99, #00cc66)";
    }

    // Suggestions
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

    if (data.score === 5 && password.length >= 12) {
      tips.innerHTML = "<li>✅ Strong password! Well done</li>";
    }

  } catch (error) {
    // Retry after 2 seconds (fixes Render sleep)
    strengthText.textContent = "Waking server... retrying ⏳";
    strengthText.style.color = "#ffa500";

    retryTimeout = setTimeout(() => {
      checkPassword();
    }, 2000);

    console.error(error);
  }
}