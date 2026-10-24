const adminLoginForm = document.getElementById("adminLoginForm");
const loginMessage = document.getElementById("loginMessage");

adminLoginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("adminEmail")
        .value.trim().toLowerCase();

    const password = document.getElementById("adminPassword").value;

    const admins = JSON.parse(
        localStorage.getItem("smartAttendAdmins") || "[]"
    );

    const admin = admins.find(function (account) {
        return account.email === email;
    });

    if (!admin) {
        loginMessage.textContent = "Invalid email or password.";
        loginMessage.style.color = "red";
        return;
    }

    try {
        const passwordBytes = new TextEncoder().encode(password);

        const hashBuffer = await crypto.subtle.digest(
            "SHA-256",
            passwordBytes
        );

        const passwordHash = Array.from(new Uint8Array(hashBuffer))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");

        if (passwordHash !== admin.passwordHash) {
            loginMessage.textContent = "Invalid email or password.";
            loginMessage.style.color = "red";
            return;
        }

        sessionStorage.setItem(
            "smartAttendLoggedInAdmin",
            JSON.stringify({
                name: admin.name,
                email: admin.email,
                adminId: admin.adminId
            })
        );

        loginMessage.textContent = "Login successful! Opening dashboard...";
        loginMessage.style.color = "green";

        // We will create this dashboard page in the next step.
        window.location.href = "admin-dashboard.html";

    } catch (error) {
        loginMessage.textContent =
            "Login could not be completed. Please use Live Server and try again.";
        loginMessage.style.color = "red";
    }
});