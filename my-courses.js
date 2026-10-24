const courseForm = document.getElementById("courseForm");
const courseList = document.getElementById("courseList");
const emptyState = document.getElementById("emptyState");
const courseCount = document.getElementById("courseCount");
const scheduledCount = document.getElementById("scheduledCount");
const savedLabel = document.getElementById("savedLabel");
const formMessage = document.getElementById("formMessage");
const cancelEdit = document.getElementById("cancelEdit");

const timetableFile = document.getElementById("timetableFile");
const fileMessage = document.getElementById("fileMessage");
const filePreview = document.getElementById("filePreview");

const STORAGE_KEY = "smartAttendCourses";

let courses = [];
let previewUrl = null;

// Load saved courses from this browser.
try {
    courses = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    if (!Array.isArray(courses)) {
        courses = [];
    }
} catch (error) {
    courses = [];
    alert("Saved course data could not be read.");
}

// Save the course list.
function saveCourses() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
        return true;
    } catch (error) {
        alert("Your courses could not be saved. Browser storage may be full or unavailable.");
        return false;
    }
}

// Prevent course information from being treated as HTML.
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return replacements[character];
    });
}

// Display the courses on the page.
function displayCourses() {
    courseList.innerHTML = "";

    courseCount.textContent = courses.length;
    scheduledCount.textContent = courses.length;
    savedLabel.textContent =
        courses.length + (courses.length === 1 ? " course" : " courses");

    emptyState.hidden = courses.length !== 0;

    courses.forEach(function (course) {
        const item = document.createElement("article");
        item.className = "course-item";

        item.innerHTML = `
            <div class="course-details">
                <h3>${escapeHTML(course.name)}</h3>
                <p class="course-code">
                    ${escapeHTML(course.code || "No course code")}
                </p>
                <p>📅 ${escapeHTML(course.day)}</p>
                <p>🕒 ${escapeHTML(course.startTime)} – ${escapeHTML(course.endTime)}</p>
                <p>📍 ${escapeHTML(course.venue || "Venue not provided")}</p>
                <p>👨‍🏫 ${escapeHTML(course.lecturer || "Lecturer not provided")}</p>
                <p>🔔 Reminder: ${escapeHTML(course.reminder)} minutes before class</p>
            </div>

            <div class="course-actions">
                <button type="button" data-action="edit"
                    data-id="${escapeHTML(course.id)}">Edit</button>

                <button type="button" class="delete-button"
                    data-action="delete"
                    data-id="${escapeHTML(course.id)}">Delete</button>
            </div>
        `;

        courseList.appendChild(item);
    });
}

// Clear the form.
function resetCourseForm() {
    courseForm.reset();

    document.getElementById("courseId").value = "";
    document.getElementById("formTitle").textContent = "Add a Course";
    document.getElementById("saveButton").textContent = "Save Course";

    cancelEdit.hidden = true;
    formMessage.textContent = "";
}

// Add a new course or update an existing one.
courseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const id = document.getElementById("courseId").value;
    const name = document.getElementById("courseName").value.trim();
    const code = document.getElementById("courseCode").value.trim();
    const lecturer = document.getElementById("lecturer").value.trim();
    const day = document.getElementById("courseDay").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;
    const venue = document.getElementById("venue").value.trim();
    const reminder = document.getElementById("reminder").value;

    if (!name || !day || !startTime || !endTime) {
        formMessage.textContent =
            "Please complete all required fields.";
        return;
    }

    if (endTime <= startTime) {
        formMessage.textContent =
            "The end time must be later than the start time.";
        return;
    }

    const course = {
        id: id || (
            window.crypto && window.crypto.randomUUID
                ? window.crypto.randomUUID()
                : String(Date.now()) + Math.random().toString(16).slice(2)
        ),
        name,
        code,
        lecturer,
        day,
        startTime,
        endTime,
        venue,
        reminder
    };

    const previousCourses = [...courses];

    if (id) {
        courses = courses.map(function (existingCourse) {
            return existingCourse.id === id ? course : existingCourse;
        });
    } else {
        courses.push(course);
    }

    if (!saveCourses()) {
        courses = previousCourses;
        return;
    }

    displayCourses();
    resetCourseForm();

    formMessage.textContent = id
        ? "Course updated successfully!"
        : "Course saved successfully!";
});

// Edit or delete a course.
courseList.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const id = button.dataset.id;
    const action = button.dataset.action;

    const course = courses.find(function (item) {
        return item.id === id;
    });

    if (!course) {
        return;
    }

    if (action === "edit") {
        document.getElementById("courseId").value = course.id;
        document.getElementById("courseName").value = course.name;
        document.getElementById("courseCode").value = course.code;
        document.getElementById("lecturer").value = course.lecturer;
        document.getElementById("courseDay").value = course.day;
        document.getElementById("startTime").value = course.startTime;
        document.getElementById("endTime").value = course.endTime;
        document.getElementById("venue").value = course.venue;
        document.getElementById("reminder").value = course.reminder;

        document.getElementById("formTitle").textContent = "Edit Course";
        document.getElementById("saveButton").textContent = "Update Course";

        cancelEdit.hidden = false;
        formMessage.textContent = "Edit the details and click Update Course.";

        document.getElementById("courseName").focus();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (action === "delete") {
        const confirmed = window.confirm(
            "Are you sure you want to delete " + course.name + "?"
        );

        if (!confirmed) {
            return;
        }

        const previousCourses = [...courses];

        courses = courses.filter(function (item) {
            return item.id !== id;
        });

        if (!saveCourses()) {
            courses = previousCourses;
            return;
        }

        displayCourses();
        resetCourseForm();
    }
});

// Cancel editing.
cancelEdit.addEventListener("click", resetCourseForm);

// Preview an uploaded PDF or image.
timetableFile.addEventListener("change", function () {
    const file = timetableFile.files[0];

    if (!file) {
        return;
    }

    const allowedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg"
    ];

    const allowedExtensions = /\.(pdf|png|jpe?g)$/i;

    if (
        !allowedTypes.includes(file.type) &&
        !allowedExtensions.test(file.name)
    ) {
        fileMessage.textContent =
            "Please select a PDF, PNG, JPG or JPEG timetable.";

        timetableFile.value = "";
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        fileMessage.textContent =
            "The file is too large. Please select a file smaller than 10 MB.";

        timetableFile.value = "";
        return;
    }

    // Release the previous temporary preview.
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
    }

    previewUrl = URL.createObjectURL(file);

    fileMessage.textContent =
        "Selected: " + file.name +
        " (" + (file.size / 1024).toFixed(1) + " KB)";

    filePreview.replaceChildren();
    filePreview.hidden = false;

    const fileTitle = document.createElement("strong");
    fileTitle.textContent = file.name;
    filePreview.appendChild(fileTitle);

    if (file.type.startsWith("image/")) {
        const image = document.createElement("img");
        image.src = previewUrl;
        image.alt = "Preview of uploaded timetable";
        filePreview.appendChild(image);
    } else if (
        file.type === "application/pdf" ||
        /\.pdf$/i.test(file.name)
    ) {
        const pdf = document.createElement("iframe");
        pdf.src = previewUrl;
        pdf.title = "Uploaded timetable PDF";
        filePreview.appendChild(pdf);
    }

    const note = document.createElement("p");
    note.className = "message";
    note.textContent =
        "Preview only. Enter the courses in the form and save them to your course list.";

    filePreview.appendChild(note);
});

// Show the saved courses when the page opens.
displayCourses();