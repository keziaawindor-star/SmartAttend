document.addEventListener("DOMContentLoaded", function () {
    // Get the login form elements
    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");

    const emailInput = loginForm
        ? loginForm.querySelector('input[type="email"]')
        : null;

    const passwordInput = loginForm
        ? loginForm.querySelector(
            'input[name="password"], input[type="password"]'
        )
        : null;

    // -----------------------------------
    // 1. SHOW AND HIDE PASSWORD
    // -----------------------------------

    const togglePassword = document.getElementById("togglePassword");

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            const isPasswordHidden = passwordInput.type === "password";

            passwordInput.type = isPasswordHidden ? "text" : "password";

            // Update the button label
            togglePassword.textContent = isPasswordHidden ? "Hide" : "Show";

            togglePassword.setAttribute(
                "aria-label",
                isPasswordHidden ? "Hide password" : "Show password"
            );
        });
    }

    // -----------------------------------
    // 2. LOGIN FORM VALIDATION
    // -----------------------------------

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (loginMessage) {
                loginMessage.textContent = "";
            }

            const email = emailInput
                ? emailInput.value.trim().toLowerCase()
                : "";

            const password = passwordInput
                ? passwordInput.value
                : "";

            if (!email || !password) {
                showMessage("Please enter your email and password.");
                return;
            }

            // -----------------------------------
            // 3. FIND THE REGISTERED STUDENT
            // -----------------------------------

            let students = [];

            try {
                students = JSON.parse(
                    localStorage.getItem("smartAttendStudents") || "[]"
                );

                if (!Array.isArray(students)) {
                    students = [];
                }
            } catch (error) {
                showMessage("Could not read registered accounts.");
                return;
            }

            const student = students.find(function (item) {
                return (
                    item.email &&
                    item.email.trim().toLowerCase() === email &&
                    item.password === password
                );
            });

            if (!student) {
                showMessage(
                    "Incorrect email or password. Please check your details or create an account."
                );
                return;
            }

            // -----------------------------------
            // 4. SAVE THE CURRENT LOGIN SESSION
            // -----------------------------------

            sessionStorage.setItem(
                "smartAttendLoggedInStudent",
                JSON.stringify({
                    name: student.name || student.fullName || "Student",
                    email: student.email,
                    studentId: student.studentId || ""
                })
            );

            // -----------------------------------
            // 5. OPEN THE STUDENT DASHBOARD
            // -----------------------------------

            window.location.href = "student dashboard.html";
        });
    }

    // Display messages on the login page
    function showMessage(message) {
        if (loginMessage) {
            loginMessage.textContent = message;
        } else {
            alert(message);
        }
    }

    // -----------------------------------
    // 6. FORGOT PASSWORD MESSAGE
    // -----------------------------------

    const forgotPassword = document.getElementById("forgotPassword");

    if (forgotPassword) {
        forgotPassword.addEventListener("click", function (event) {
            event.preventDefault();

            showMessage(
                "Password recovery is not available yet. Please contact the administrator."
            );
        });
    }
});