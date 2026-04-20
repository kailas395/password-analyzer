function togglePassword() {
  const input = document.getElementById("password");
  input.type = input.type === "password" ? "text" : "password";
}

async function checkPassword() {
  const password = document.getElementById("password").value;
  const strengthText = document.getElementById("strength");
  const bar = document.getElementById("strength-bar");
  const tips = document.getElementById("tips");

  if (!password) {
    strengthText.textContent = "Enter password first";
    return;
  }

  const res = await fetch("https://YOUR-RENDER-URL.onrender.com/check-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ password })
  });

  const data = await res.json();

  strengthText.textContent = `${data.strength} (${data.score}/5)`;
  tips.innerHTML = "";

  const width = (data.score / 5) * 100;
  bar.style.width = width + "%";

  if (data.strength === "Weak") {
    bar.style.background = "red";
  } else if (data.strength === "Medium") {
    bar.style.background = "orange";
  } else {
    bar.style.background = "limegreen";
  }

  if (password.length < 8) tips.innerHTML += "<li>Use at least 8 characters</li>";
  if (!/[A-Z]/.test(password)) tips.innerHTML += "<li>Add uppercase letter</li>";
  if (!/[0-9]/.test(password)) tips.innerHTML += "<li>Add numbers</li>";
  if (!/[^A-Za-z0-9]/.test(password)) tips.innerHTML += "<li>Add special characters</li>";
}