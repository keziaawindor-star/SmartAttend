document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("profileForm");
    if (!form) return;

    removePictureButton.addEventListener("click", function () {
    selectedPicture = "";
    showPicture("", fields.name.value);
    pictureInput.value = "";
    message.textContent =
        "Picture removed. Click Save Changes to confirm.";
});
    const editButton = document.getElementById("editProfileButton");
    const saveButton = document.getElementById("saveProfileButton");
    const cancelButton = document.getElementById("cancelProfileButton");
    const pictureInput = document.getElementById("profilePicture");
    const avatar = document.getElementById("profileAvatar");
    const message = document.getElementById("profileMessage");
    const removePictureButton = document.getElementById("removeProfilePicture");

    const fields = {
        name: document.getElementById("profileName"),
        studentId: document.getElementById("profileStudentId"),
        email: document.getElementById("profileEmail"),
        department: document.getElementById("profileDepartment"),
        level: document.getElementById("profileLevel")
    };

    let students = [];
    let currentStudent = null;
    let originalDetails = {};
    let selectedPicture = "";

    try {
        students = JSON.parse(
            localStorage.getItem("smartAttendStudents") || "[]"
        );

        if (!Array.isArray(students)) students = [];
    } catch (error) {
        students = [];
    }

    try {
        currentStudent = JSON.parse(
            sessionStorage.getItem("smartAttendLoggedInStudent") || "null"
        );
    } catch (error) {
        currentStudent = null;
    }

    if (!currentStudent || !currentStudent.email) {
        message.textContent = "Please log in to view your profile.";
        form.querySelectorAll("input, select, button").forEach(function (item) {
            item.disabled = true;
        });
        editButton.disabled = true;
        return;
    }

    function findStudent() {
        return students.find(function (student) {
            return student.email &&
                student.email.toLowerCase() ===
                currentStudent.email.toLowerCase();
        });
    }

    function pictureStorageKey() {
        return "smartAttendProfilePicture_" +
            currentStudent.email.toLowerCase();
    }

    function showPicture(picture, name) {
        avatar.replaceChildren();

        if (picture) {
            const image = document.createElement("img");
            image.src = picture;
            image.alt = "Student profile picture";
            avatar.appendChild(image);
        } else {
            avatar.textContent = (name || "S").trim().charAt(0).toUpperCase();
        }
    }

    function loadProfile() {
        const student = findStudent();

        if (!student) {
            message.textContent =
                "Your registered details could not be found. Please log in again.";
            return;
        }

        fields.name.value = student.name || student.fullName || "";
        fields.studentId.value = student.studentId || "";
        fields.email.value = student.email || "";
        fields.department.value = student.department || "";
        fields.level.value = String(student.level || "");

        try {
            selectedPicture = localStorage.getItem(pictureStorageKey()) || "";
        } catch (error) {
            selectedPicture = "";
        }

        showPicture(selectedPicture, fields.name.value);

        originalDetails = {
            name: fields.name.value,
            studentId: fields.studentId.value,
            email: fields.email.value,
            department: fields.department.value,
            level: fields.level.value
        };
    }

    function setEditing(editing) {
        fields.name.disabled = !editing;
        fields.email.disabled = !editing;
        fields.department.disabled = !editing;
        fields.level.disabled = !editing;
        removePictureButton.disabled = !editing;

        // Student ID remains read-only.
        fields.studentId.disabled = true;

        editButton.hidden = editing;
        saveButton.hidden = !editing;
        cancelButton.hidden = !editing;
        pictureInput.disabled = !editing;

        message.textContent = "";
    }

    editButton.addEventListener("click", function () {
        loadProfile();
        setEditing(true);
    });

    cancelButton.addEventListener("click", function () {
        loadProfile();
        pictureInput.value = "";
        setEditing(false);
        message.textContent = "Changes cancelled.";
    });

    pictureInput.addEventListener("change", function () {
        const file = pictureInput.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            message.textContent = "Please select an image file.";
            pictureInput.value = "";
            return;
        }

        // Limit image size to help avoid browser storage errors.
        if (file.size > 1024 * 1024) {
            message.textContent =
                "Please choose an image smaller than 1 MB.";
            pictureInput.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = function () {
            selectedPicture = reader.result;
            showPicture(selectedPicture, fields.name.value);
            message.textContent = "Picture selected. Save your changes to keep it.";
        };

        reader.onerror = function () {
            message.textContent = "Could not read that image. Please try another.";
        };

        reader.readAsDataURL(file);
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const studentIndex = students.findIndex(function (student) {
            return student.email &&
                student.email.toLowerCase() ===
                currentStudent.email.toLowerCase();
        });

        if (studentIndex === -1) {
            message.textContent = "Student account not found.";
            return;
        }

        const newEmail = fields.email.value.trim().toLowerCase();

        if (!newEmail) {
            message.textContent = "Please enter an email address.";
            return;
        }

        const duplicateEmail = students.some(function (student, index) {
            return index !== studentIndex && student.email &&
                student.email.toLowerCase() === newEmail;
        });

        if (duplicateEmail) {
            message.textContent = "That email is already used by another account.";
            return;
        }

        const updatedStudent = {
            ...students[studentIndex],
            name: fields.name.value.trim(),
            email: newEmail,
            department: fields.department.value.trim(),
            level: fields.level.value
        };

        if (!updatedStudent.name || !updatedStudent.department ||
            !updatedStudent.level) {
            message.textContent = "Please complete all required fields.";
            return;
        }

        const oldEmail = currentStudent.email.toLowerCase();

        students[studentIndex] = updatedStudent;

        try {
            localStorage.setItem(
                "smartAttendStudents",
                JSON.stringify(students)
            );

            const oldPictureKey = "smartAttendProfilePicture_" + oldEmail;
            const newPictureKey = "smartAttendProfilePicture_" + newEmail;

            if (selectedPicture) {
                localStorage.setItem(newPictureKey, selectedPicture);
            } else {
                localStorage.removeItem(newPictureKey);
            }

            if (oldEmail !== newEmail) {
                localStorage.removeItem(oldPictureKey);
          }
        } catch (error) {
            message.textContent =
                "Could not save your changes. Try choosing a smaller picture.";
            return;
        }

        currentStudent = {
            name: updatedStudent.name,
            email: updatedStudent.email,
            studentId: updatedStudent.studentId || ""
        };

        sessionStorage.setItem(
            "smartAttendLoggedInStudent",
            JSON.stringify(currentStudent)
        );

        pictureInput.value = "";
        loadProfile();
        setEditing(false);
        message.textContent = "Your profile has been updated successfully!";
    });

    pictureInput.disabled = true;
    loadProfile();
    setEditing(false);
});

document.addEventListener("DOMContentLoaded", function () {
    const sessionKey = "smartAttendLoggedInStudent";
    const studentsKey = "smartAttendStudents";

    const savedSession = sessionStorage.getItem(sessionKey);

    if (!savedSession) {
        console.log("No signed-in student was found.");
        return;
    }

    let loggedInStudent;

    try {
        loggedInStudent = JSON.parse(savedSession);
    } catch (error) {
        console.error("Could not read student session:", error);
        return;
    }

    const email = (loggedInStudent.email || "").toLowerCase();

    let students = JSON.parse(localStorage.getItem(studentsKey) || "[]");

    // Find an existing SmartAttend account with the same email.
    let account = students.find(function (student) {
        return (student.email || "").toLowerCase() === email;
    });

    // Use the Google details when available.
    const googleProfile = JSON.parse(
        sessionStorage.getItem("smartAttendGoogleProfile") || "{}"
    );

    const name = googleProfile.name || loggedInStudent.name || "";
    const picture = googleProfile.picture || "";

    const nameField = document.getElementById("profileName");
    const idField = document.getElementById("profileStudentId");
    const emailField = document.getElementById("profileEmail");
    const departmentField = document.getElementById("profileDepartment");
    const levelField = document.getElementById("profileLevel");

    const avatar = document.getElementById("profileAvatar");
    const pictureInput = document.getElementById("profilePicture");
    const removePictureButton = document.getElementById("removeProfilePicture");

    const editButton = document.getElementById("editProfileButton");
    const saveButton = document.getElementById("saveProfileButton");
    const cancelButton = document.getElementById("cancelProfileButton");
    const form = document.getElementById("profileForm");
    const message = document.getElementById("profileMessage");

    if (!nameField || !emailField || !avatar) {
        console.error("Some profile HTML elements could not be found.");
        return;
    }

    // Keep the student's existing details where available.
    const studentDetails = account || loggedInStudent;

    nameField.value = name || studentDetails.name || "";
    idField.value = studentDetails.studentId || "";
    emailField.value = email || studentDetails.email || "";
    departmentField.value = studentDetails.department || "";
    levelField.value = studentDetails.level || "";

    // Display the Google picture, or a previously uploaded picture.
    const pictureKey = "smartAttendProfilePicture_" + email;
    const uploadedPicture = localStorage.getItem(pictureKey);
    const initialPicture = uploadedPicture || picture;

    function displayPicture(imageUrl) {
        let image = avatar.querySelector("img");

        if (imageUrl) {
            if (!image) {
                image = document.createElement("img");
                image.alt = "Student profile picture";
                image.style.width = "100%";
                image.style.height = "100%";
                image.style.objectFit = "cover";
                image.style.borderRadius = "50%";
                avatar.replaceChildren(image);
            }

            image.src = imageUrl;
            image.onerror = function () {
                image.removeAttribute("src");
            };
        } else if (image) {
            image.remove();
            avatar.textContent = (nameField.value.trim()[0] || "S").toUpperCase();
        } else {
            avatar.textContent = (nameField.value.trim()[0] || "S").toUpperCase();
        }
    }

    displayPicture(initialPicture);

    // Keep the profile fields read-only until Edit is clicked.
    const editableFields = [
        nameField,
        departmentField,
        levelField
    ];

    function setEditing(editing) {
        editableFields.forEach(function (field) {
            field.readOnly = !editing;
        });

        if (departmentField) departmentField.disabled = !editing;
        if (levelField) levelField.disabled = !editing;

        if (editButton) editButton.hidden = editing;
        if (saveButton) saveButton.hidden = !editing;
        if (cancelButton) cancelButton.hidden = !editing;

        if (pictureInput) pictureInput.disabled = !editing;
        if (removePictureButton) removePictureButton.disabled = !editing;
    }

    function showMessage(text, isError) {
        if (message) {
            message.textContent = text;
            message.style.color = isError ? "#dc2626" : "#0d9488";
        }
    }

    const originalValues = {};

    function rememberValues() {
        originalValues.name = nameField.value;
        originalValues.studentId = idField.value;
        originalValues.email = emailField.value;
        originalValues.department = departmentField.value;
        originalValues.level = levelField.value;
    }

    rememberValues();
    setEditing(false);

    if (editButton) {
        editButton.addEventListener("click", function () {
            rememberValues();
            setEditing(true);
            showMessage("", false);
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", function () {
            nameField.value = originalValues.name;
            idField.value = originalValues.studentId;
            emailField.value = originalValues.email;
            departmentField.value = originalValues.department;
            levelField.value = originalValues.level;

            displayPicture(
                localStorage.getItem(pictureKey) || picture
            );

            if (pictureInput) pictureInput.value = "";
            setEditing(false);
            showMessage("Changes cancelled.", false);
        });
    }

    if (pictureInput) {
        pictureInput.addEventListener("change", function () {
            const file = pictureInput.files[0];

            if (!file) return;

            if (!file.type.startsWith("image/")) {
                showMessage("Please select an image file.", true);
                pictureInput.value = "";
                return;
            }

            if (file.size > 1024 * 1024) {
                showMessage("Please choose an image smaller than 1 MB.", true);
                pictureInput.value = "";
                return;
            }

            const reader = new FileReader();

            reader.onload = function (event) {
                displayPicture(event.target.result);
                showMessage("Picture preview updated. Click Save to keep it.", false);
            };

            reader.readAsDataURL(file);
        });
    }

    if (removePictureButton) {
        removePictureButton.addEventListener("click", function () {
            localStorage.removeItem(pictureKey);
            displayPicture(picture);
            if (pictureInput) pictureInput.value = "";
            showMessage("Google picture restored, if available.", false);
        });
    }

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const updatedStudent = {
                name: nameField.value.trim(),
                studentId: idField.value.trim(),
                email: emailField.value.trim(),
                department: departmentField.value,
                level: levelField.value
            };

            if (!updatedStudent.name || !updatedStudent.email) {
                showMessage("Name and email are required.", true);
                return;
            }

            // Update an existing account, or create a basic profile
            // for a Google user who has not registered separately.
            const existingIndex = students.findIndex(function (student) {
                return (student.email || "").toLowerCase() === email;
            });

            if (existingIndex >= 0) {
                students[existingIndex] = {
                    ...students[existingIndex],
                    ...updatedStudent
                };
            } else {
                students.push(updatedStudent);
            }

            localStorage.setItem(studentsKey, JSON.stringify(students));

            loggedInStudent = {
                ...loggedInStudent,
                ...updatedStudent
            };

            sessionStorage.setItem(
                sessionKey,
                JSON.stringify(loggedInStudent)
            );

            // Save a newly selected profile picture.
            const displayedImage = avatar.querySelector("img");

            if (displayedImage && pictureInput && pictureInput.files[0]) {
                localStorage.setItem(pictureKey, displayedImage.src);
            }

            rememberValues();
            setEditing(false);
            showMessage("Your profile has been saved!", false);
        });
    }
});