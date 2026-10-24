const loggedInAdmin = JSON.parse(
    sessionStorage.getItem("smartAttendLoggedInAdmin") || "null"
);

// Return to login if no administrator session exists.
if (!loggedInAdmin) {
    window.location.replace("admin-login.html");
} else {
    const adminName = document.getElementById("adminName");
    const adminWelcome = document.getElementById("adminWelcome");
    const adminId = document.getElementById("adminId");
    const adminEmail = document.getElementById("adminEmail");
    const avatar = document.querySelector(".avatar");

    if (adminName) {
        adminName.textContent = loggedInAdmin.name;
    }

    if (adminWelcome) {
        const firstName = loggedInAdmin.name.trim().split(/\s+/)[0];
        adminWelcome.textContent = `Welcome back, ${firstName}! 👋`;
    }

    if (adminId) {
        adminId.textContent = loggedInAdmin.adminId;
    }

    if (adminEmail) {
        adminEmail.textContent = loggedInAdmin.email;
    }

    if (avatar) {
        avatar.textContent = loggedInAdmin.name.trim().charAt(0).toUpperCase();
    }
}

// Log out of the administrator dashboard.
const adminLogout = document.getElementById("adminLogout");

if (adminLogout) {
    adminLogout.addEventListener("click", function () {
        sessionStorage.removeItem("smartAttendLoggedInAdmin");
        window.location.href = "admin-login.html";
    });
}