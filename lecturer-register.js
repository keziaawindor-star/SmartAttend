const lecturerRegisterForm = document.getElementById("lecturerRegisterForm");
const registerMessage = document.getElementById("registerMessage");

lecturerRegisterForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("lecturerName").value.trim();
    const staffId = document.getElementById("staffId").value.trim();
    const email = document.getElementById("lecturerEmail").value.trim().toLowerCase();
    const department = document.getElementById("department").value.trim();
    const password = document.getElementById("lecturerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password.length < 8) {
        showMessage("Your password must contain at least 8 characters.", false);
        return;
    }

    if (password !== confirmPassword) {
        showMessage("Your passwords do not match.", false);
        return;
    }

    let lecturers = [];

    try {
        lecturers = JSON.parse(
            localStorage.getItem("smartAttendLecturers") || "[]"
        );

        if (!Array.isArray(lecturers)) {
            lecturers = [];
        }
    } catch (error) {
        showMessage("Could not read the saved accounts. Check your browser storage.", false);
        return;
    }

    const accountExists = lecturers.some(function (lecturer) {
        return lecturer.email.toLowerCase() === email ||
               lecturer.staffId.toLowerCase() === staffId.toLowerCase();
    });

    if (accountExists) {
        showMessage("This email address or staff ID is already registered.", false);
        return;
    }

    const newLecturer = {
        name: name,
        staffId: staffId,
        email: email,
        department: department,
        password: password
    };

    lecturers.push(newLecturer);

    try {
        localStorage.setItem("smartAttendLecturers", JSON.stringify(lecturers));
    } catch (error) {
        showMessage("Your account could not be saved. Check browser storage.", false);
        return;
    }

    showMessage("Registration successful! Opening lecturer login...", true);
    lecturerRegisterForm.reset();

    setTimeout(function () {
        window.location.href = "lecturer-login.html";
    }, 1200);
});

function showMessage(message, success) {
    registerMessage.textContent = message;
    registerMessage.style.color = success ? "#0f766e" : "#dc2626";
}