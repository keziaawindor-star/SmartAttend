const adminRegisterForm = document.getElementById("adminRegisterForm");
const registerMessage = document.getElementById("registerMessage");

adminRegisterForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("adminName").value.trim();
    const email = document.getElementById("adminEmail").value.trim().toLowerCase();
    const adminId = document.getElementById("adminId").value.trim();
    const password = document.getElementById("adminPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Check that both passwords match.
    if (password !== confirmPassword) {
        registerMessage.textContent = "Passwords do not match.";
        registerMessage.style.color = "red";
        return;
    }

    // Require a password of at least 8 characters.
    if (password.length < 8) {
        registerMessage.textContent = "Your password must contain at least 8 characters.";
        registerMessage.style.color = "red";
        return;
    }

    // Read previously registered prototype accounts.
    const admins = JSON.parse(localStorage.getItem("smartAttendAdmins") || "[]");

    // Prevent duplicate email addresses and administrator IDs.
    const accountExists = admins.some(function (admin) {
        return admin.email === email || admin.adminId.toLowerCase() === adminId.toLowerCase();
    });

    if (accountExists) {
        registerMessage.textContent = "This email or Administrator ID is already registered.";
        registerMessage.style.color = "red";
        return;
    }

    try {
        // Hash the password for this front-end prototype.
        const passwordBytes = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", passwordBytes);
        const passwordHash = Array.from(new Uint8Array(hashBuffer))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");

        const newAdmin = {
            name: name,
            email: email,
            adminId: adminId,
            passwordHash: passwordHash
        };

        admins.push(newAdmin);
        localStorage.setItem("smartAttendAdmins", JSON.stringify(admins));

        registerMessage.textContent = "Registration successful! You can now log in.";
        registerMessage.style.color = "green";

        adminRegisterForm.reset();

    } catch (error) {
        registerMessage.textContent = "Registration failed. Please try again using Live Server.";
        registerMessage.style.color = "red";
    }
});