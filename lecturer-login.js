const lecturerLoginForm = document.getElementById("lecturerLoginForm");
const loginMessage = document.getElementById("loginMessage");

lecturerLoginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("lecturerEmail")
        .value.trim().toLowerCase();

    const password = document.getElementById("lecturerPassword").value;

    let lecturers;

    try {
        lecturers = JSON.parse(
            localStorage.getItem("smartAttendLecturers") || "[]"
        );

        if (!Array.isArray(lecturers)) {
            lecturers = [];
        }
    } catch (error) {
        showLoginMessage("Unable to read saved accounts. Please try again.", false);
        return;
    }

    const lecturer = lecturers.find(function (item) {
        return item.email.toLowerCase() === email &&
               item.password === password;
    });

    if (!lecturer) {
        showLoginMessage(
            "Incorrect email or password. Please check your details.",
            false
        );
        return;
    }

    const loggedInLecturer = {
        name: lecturer.name,
        staffId: lecturer.staffId,
        email: lecturer.email,
        department: lecturer.department
    };

    sessionStorage.setItem(
        "smartAttendLoggedInLecturer",
        JSON.stringify(loggedInLecturer)
    );

    showLoginMessage("Login successful! Opening your dashboard...", true);

    setTimeout(function () {
        window.location.href = "lecturer%20dashboard.html";
    }, 1000);
});

function showLoginMessage(message, success) {
    loginMessage.textContent = message;
    loginMessage.style.color = success ? "#0f766e" : "#dc2626";
}