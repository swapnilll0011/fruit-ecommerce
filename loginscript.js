const baseUrl = "http://localhost:3000"; // Backend URL

function validateInputs(fields) {
    return fields.every(field => field.trim() !== "");
}

function enforceNumericInput(event) {
    event.target.value = event.target.value.replace(/\D/g, '');
}

document.addEventListener("DOMContentLoaded", () => {
    const phoneInput = document.getElementById("signup-phone");
    if (phoneInput) {
        phoneInput.addEventListener("input", enforceNumericInput);
    }
});

async function signup() {
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const phone = document.getElementById("signup-phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const password = document.getElementById("signup-password").value;

    let nameRegex = /^[A-Za-z\s]+$/;
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let phoneRegex = /^[0-9]{10}$/;
    let passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!validateInputs([name, email, phone, address, password])) {
        alert("Please fill all fields!");
        return;
    }
    if (!nameRegex.test(name)) {
        alert("Invalid name. Use only letters and spaces.");
        return;
    }
    if (!emailRegex.test(email)) {
        alert("Invalid email format.");
        return;
    }
    if (!phoneRegex.test(phone)) {
        alert("Phone number must be 10 digits.");
        return;
    }
    if (!passwordRegex.test(password)) {
        alert("Password must be at least 8 characters, including a number.");
        return;
    }

    try {
        const response = await fetch(`${baseUrl}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, phone, address, password }),
        });

        const data = await response.json();
        console.log("Signup Response:", data); // Debugging

        if (response.ok) {
            alert("Signup successful!");

            // Store token and user in localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Redirect to dashboard or home page
            window.location.href = "front-home.html";
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Signup Error:", error);
        alert("An error occurred. Please try again.");
    }
}

async function login() {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!validateInputs([email, password])) {
        alert("Please fill all fields!");
        return;
    }
    if (!emailRegex.test(email)) {
        alert("Invalid email format.");
        return;
    }
    if (!passwordRegex.test(password)) {
        alert("Invalid password format. It must be at least 8 characters long and contain at least one letter and one number.");
        return;
    }

    try {
        const response = await fetch(`${baseUrl}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log("Login Response:", data); // Debugging

        if (!data.token) {
            alert(data.message || "Login failed.");
            return;
        }

        localStorage.setItem("token", data.token);

        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            console.log("Stored User:", localStorage.getItem("user")); // Debugging
        } else {
            console.warn("User data missing in response");
        }

        console.log("Redirecting to front-home.html...");
        window.location.href = "front-home.html";

    } catch (error) {
        console.error("Login Error:", error);
        alert("Login failed. Please try again later.");
    }
}

function toggleForms() {
    document.getElementById("signup-container").classList.toggle("hidden");
    document.getElementById("login-container").classList.toggle("hidden");
}
