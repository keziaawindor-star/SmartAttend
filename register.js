document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const registerMessage = document.getElementById("registerMessage");

    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();
        registerMessage.textContent = "";

        // Get the student's details
        const name = document.getElementById("fullName").value.trim();
        const studentId = document.getElementById("studentId").value.trim();
        const email = document.getElementById("registerEmail").value.trim().toLowerCase();
        const department = document.getElementById("department").value.trim();
        const level = document.getElementById("level").value;
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const agreeTerms = document.getElementById("agreeTerms").checked;

        // Validate the details
        if (password.length < 8) {
            registerMessage.textContent =
                "Your password must contain at least 8 characters.";
            return;
        }

        if (password !== confirmPassword) {
            registerMessage.textContent =
                "Your passwords do not match. Please try again.";
            return;
        }

        if (!agreeTerms) {
            registerMessage.textContent =
                "Please confirm that your information is correct.";
            return;
        }

        // Retrieve previously registered students
        let students = [];

        try {
            students = JSON.parse(
                localStorage.getItem("smartAttendStudents") || "[]"
            );

            if (!Array.isArray(students)) {
                students = [];
            }
        } catch (error) {
            registerMessage.textContent =
                "Unable to read saved accounts. Please try again.";
            return;
        }

        // Check whether the email is already registered
        const emailExists = students.some(function (student) {
            return student.email &&
                student.email.toLowerCase() === email;
        });

        if (emailExists) {
            registerMessage.textContent =
                "This email is already registered. Please log in.";
            return;
        }

        // Check whether the student ID is already registered
        const idExists = students.some(function (student) {
            return student.studentId &&
                student.studentId.toLowerCase() === studentId.toLowerCase();
        });

        if (idExists) {
            registerMessage.textContent =
                "This student ID is already registered.";
            return;
        }

        // Create the new student account
        const newStudent = {
            name: name,
            studentId: studentId,
            email: email,
            department: department,
            level: level,
            password: password
        };

        students.push(newStudent);

        // Save the account in the browser
        try {
            localStorage.setItem(
                "smartAttendStudents",
                JSON.stringify(students)
            );
        } catch (error) {
            registerMessage.textContent =
                "The account could not be saved. Please try again.";
            return;
        }

        registerMessage.textContent =
            "Account created successfully! Redirecting to login...";

        registerForm.reset();

        setTimeout(function () {
            window.location.href = "login.html";
        }, 1500);
    });
});