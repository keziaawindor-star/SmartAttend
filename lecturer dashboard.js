/* SMARTATTEND LECTURER DASHBOARD */

const loggedInLecturer = JSON.parse(
    sessionStorage.getItem("smartAttendLoggedInLecturer") || "null"
);

// Require a lecturer login before showing the dashboard.
if (!loggedInLecturer) {
    window.location.replace("lecturer-login.html");
} else {
    startLecturerDashboard();
}

function startLecturerDashboard() {
    const lecturerEmail = loggedInLecturer.email.toLowerCase();
    const storageSuffix = encodeURIComponent(lecturerEmail);

    const coursesKey = "smartAttendCourses_" + storageSuffix;
    const sessionsKey = "smartAttendSessions_" + storageSuffix;
    const recordsKey = "smartAttendAttendance_" + storageSuffix;

    let courses = readList(coursesKey);
    let sessions = readList(sessionsKey);
    let attendanceRecords = readList(recordsKey);

    // DISPLAY LECTURER DETAILS

    document.getElementById("headerLecturerName").textContent =
        loggedInLecturer.name;

    document.getElementById("welcomeLecturerName").textContent =
        loggedInLecturer.name.split(" ")[0];

    document.getElementById("profileLecturerName").textContent =
        loggedInLecturer.name;

    document.getElementById("profileLecturerEmail").textContent =
        loggedInLecturer.email;

    document.getElementById("profileLecturerStaffId").textContent =
        "Staff ID: " + loggedInLecturer.staffId;

    document.getElementById("profileLecturerDepartment").textContent =
        "Department: " + loggedInLecturer.department;

    // SET TODAY'S DATE AS THE DEFAULT SESSION DATE

    const today = new Date();
    const localToday =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");

    document.getElementById("sessionDate").value = localToday;
    document.getElementById("sessionDate").min = localToday;

    // READ AND SAVE DATA

    function readList(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(value) ? value : [];
        } catch (error) {
            return [];
        }
    }

    function saveData() {
        try {
            localStorage.setItem(coursesKey, JSON.stringify(courses));
            localStorage.setItem(sessionsKey, JSON.stringify(sessions));
            localStorage.setItem(recordsKey, JSON.stringify(attendanceRecords));
            return true;
        } catch (error) {
            alert("Could not save data. Check your browser storage.");
            return false;
        }
    }

    // UPDATE DASHBOARD STATISTICS

    function updateStats() {
        document.getElementById("courseCount").textContent = courses.length;
        document.getElementById("sessionCount").textContent = sessions.length;
        document.getElementById("attendanceCount").textContent =
            attendanceRecords.length;

        const totalExpected = attendanceRecords.reduce(function (sum, record) {
            return sum + (Number(record.expected) || 0);
        }, 0);

        const totalPresent = attendanceRecords.reduce(function (sum, record) {
            return sum + (Number(record.present) || 0);
        }, 0);

        document.getElementById("attendanceRate").textContent =
            totalExpected > 0
                ? Math.round((totalPresent / totalExpected) * 100) + "%"
                : "—";
    }

    // SHOW OR HIDE FORMS

    const courseForm = document.getElementById("courseForm");
    const sessionForm = document.getElementById("sessionForm");
    const qrDisplay = document.getElementById("qrDisplay");

    document.getElementById("addCourseButton").addEventListener("click", function () {
        courseForm.classList.toggle("hidden");
        if (!courseForm.classList.contains("hidden")) {
            document.getElementById("courseCode").focus();
        }
    });

    document.getElementById("cancelCourseButton").addEventListener("click", function () {
        courseForm.reset();
        courseForm.classList.add("hidden");
    });

    document.getElementById("openSessionForm").addEventListener("click", function () {
        sessionForm.classList.toggle("hidden");
        if (!sessionForm.classList.contains("hidden")) {
            refreshCourseOptions();
        }
    });

    document.getElementById("cancelSessionButton").addEventListener("click", function () {
        sessionForm.reset();
        document.getElementById("sessionDate").value = localToday;
        sessionForm.classList.add("hidden");
    });

    document.getElementById("createSessionShortcut").addEventListener("click", function () {
        sessionForm.classList.remove("hidden");
        refreshCourseOptions();
        document.getElementById("sessions").scrollIntoView({ behavior: "smooth" });
    });

    // ADD A COURSE

    courseForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const code = document.getElementById("courseCode").value.trim().toUpperCase();
        const title = document.getElementById("courseTitle").value.trim();
        const level = document.getElementById("courseLevel").value;

        const exists = courses.some(function (course) {
            return course.code.toLowerCase() === code.toLowerCase();
        });

        if (exists) {
            alert("You have already added this course code.");
            return;
        }

        courses.push({
            id: createId(),
            code: code,
            title: title,
            level: level
        });

        if (!saveData()) {
            courses.pop();
            return;
        }

        courseForm.reset();
        courseForm.classList.add("hidden");
        renderCourses();
        updateStats();
    });

    function renderCourses() {
        const courseList = document.getElementById("courseList");

        if (courses.length === 0) {
            courseList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="book-open"></i>
                    <h3>No courses added yet</h3>
                    <p>Choose “Add Course” to add your first course.</p>
                </div>`;
        } else {
            courseList.replaceChildren();

            courses.forEach(function (course) {
                const card = document.createElement("article");
                card.className = "course-item";

                const code = document.createElement("span");
                code.className = "course-code";
                code.textContent = course.code;

                const title = document.createElement("h3");
                title.textContent = course.title;

                const level = document.createElement("p");
                level.textContent = "Level: " + course.level;

                const actions = document.createElement("div");
                actions.className = "item-actions";

                const createButton = document.createElement("button");
                createButton.type = "button";
                createButton.className = "small-button";
                createButton.textContent = "Create Session";
                createButton.addEventListener("click", function () {
                    sessionForm.classList.remove("hidden");
                    refreshCourseOptions();
                    document.getElementById("sessionCourse").value = course.id;
                    document.getElementById("sessions").scrollIntoView({
                        behavior: "smooth"
                    });
                });

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.className = "small-button danger";
                deleteButton.textContent = "Remove";
                deleteButton.addEventListener("click", function () {
                    const hasSessions = sessions.some(function (session) {
                        return session.courseId === course.id;
                    });

                    if (hasSessions) {
                        alert("This course has attendance sessions. Close or remove those sessions first.");
                        return;
                    }

                    if (confirm("Remove " + course.code + " from your course list?")) {
                        courses = courses.filter(function (item) {
                            return item.id !== course.id;
                        });

                        if (saveData()) {
                            renderCourses();
                            refreshCourseOptions();
                            updateStats();
                        }
                    }
                });

                actions.append(createButton, deleteButton);
                card.append(code, title, level, actions);
                courseList.appendChild(card);
            });
        }

        refreshCourseOptions();
        refreshIcons();
    }

    // FILL THE COURSE SELECT MENU

    function refreshCourseOptions() {
        const select = document.getElementById("sessionCourse");
        const previousValue = select.value;

        select.replaceChildren();

        const firstOption = document.createElement("option");
        firstOption.value = "";
        firstOption.textContent = courses.length
            ? "Select a course"
            : "Add a course first";

        select.appendChild(firstOption);

        courses.forEach(function (course) {
            const option = document.createElement("option");
            option.value = course.id;
            option.textContent = course.code + " — " + course.title;
            select.appendChild(option);
        });

        if (courses.some(function (course) {
            return course.id === previousValue;
        })) {
            select.value = previousValue;
        }
    }

    // CREATE AN ATTENDANCE SESSION AND QR CODE

    sessionForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const courseId = document.getElementById("sessionCourse").value;
        const date = document.getElementById("sessionDate").value;
        const duration = Number(document.getElementById("sessionDuration").value);

        const course = courses.find(function (item) {
            return item.id === courseId;
        });

        if (!course) {
            alert("Please add and select a course first.");
            return;
        }

        if (!date || date < localToday) {
            alert("Please choose today or a future date.");
            return;
        }

        const token = createId();

        const session = {
            id: token,
            courseId: course.id,
            courseCode: course.code,
            courseTitle: course.title,
            date: date,
            duration: duration,
            createdAt: new Date().toISOString(),
            status: "Created"
        };

        sessions.push(session);

        if (!saveData()) {
            sessions.pop();
            return;
        }

        sessionForm.reset();
        document.getElementById("sessionDate").value = localToday;
        document.getElementById("sessionDuration").value = "10";
        sessionForm.classList.add("hidden");

        renderSessions();
        updateStats();
        displayQRCode(session);
    });

    function displayQRCode(session) {
        qrDisplay.classList.remove("hidden");
        qrDisplay.replaceChildren();

        const heading = document.createElement("h3");
        heading.textContent = "Session QR Code";

        const details = document.createElement("p");
        details.textContent =
            session.courseCode + " — " + session.courseTitle +
            " | Date: " + session.date +
            " | Duration: " + session.duration + " minutes";

        const qrImage = document.createElement("img");
        qrImage.alt = "QR code for prototype session " + session.id;

        // Prototype only: this QR code encodes session details.
        // It does not submit attendance or verify a student.
        const qrPayload = JSON.stringify({
            app: "SmartAttend",
            type: "prototype-session",
            sessionId: session.id,
            courseCode: session.courseCode,
            date: session.date
        });

        qrImage.src =
            "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" +
            encodeURIComponent(qrPayload);

        const tokenText = document.createElement("p");
        tokenText.className = "qr-token";
        tokenText.textContent = "Session ID: " + session.id;

        const warning = document.createElement("p");
        warning.textContent =
            "Prototype QR code only. Student check-in and session expiry are not connected yet.";

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "secondary-button";
        closeButton.textContent = "Hide QR Code";
        closeButton.addEventListener("click", function () {
            qrDisplay.classList.add("hidden");
        });

        qrDisplay.append(heading, details, qrImage, tokenText, warning, closeButton);
        qrDisplay.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function renderSessions() {
        const sessionList = document.getElementById("sessionList");
        sessionList.replaceChildren();

        if (sessions.length === 0) {
            sessionList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="qr-code"></i>
                    <h3>No sessions created</h3>
                    <p>Create a course and then start an attendance session.</p>
                </div>`;
            refreshIcons();
            return;
        }

        sessions.slice().reverse().forEach(function (session) {
            const card = document.createElement("article");
            card.className = "session-item";

            const status = document.createElement("span");
            status.className = "course-code";
            status.textContent = session.status;

            const heading = document.createElement("h3");
            heading.textContent = session.courseCode + " — " + session.courseTitle;

            const date = document.createElement("p");
            date.textContent = "Date: " + session.date;

            const duration = document.createElement("p");
            duration.textContent = "Duration: " + session.duration + " minutes";

            const actions = document.createElement("div");
            actions.className = "item-actions";

            const viewButton = document.createElement("button");
            viewButton.type = "button";
            viewButton.className = "small-button";
            viewButton.textContent = "View QR Code";
            viewButton.addEventListener("click", function () {
                displayQRCode(session);
            });

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "small-button danger";
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", function () {
                if (confirm("Remove this prototype session?")) {
                    sessions = sessions.filter(function (item) {
                        return item.id !== session.id;
                    });

                    if (saveData()) {
                        renderSessions();
                        updateStats();
                        qrDisplay.classList.add("hidden");
                    }
                }
            });

            actions.append(viewButton, removeButton);
            card.append(status, heading, date, duration, actions);
            sessionList.appendChild(card);
        });

        refreshIcons();
    }

    // ATTENDANCE AND REPORT PLACEHOLDERS

    function renderAttendance() {
        const container = document.getElementById("attendanceList");
        container.replaceChildren();

        if (attendanceRecords.length === 0) {
            const message = document.createElement("p");
            message.className = "muted-text";
            message.textContent =
                "No student attendance records yet. Student check-in will be added in a later step.";
            container.appendChild(message);
            return;
        }

        attendanceRecords.forEach(function (record) {
            const item = document.createElement("p");
            item.className = "muted-text";
            item.textContent =
                record.courseCode + ": " + record.present +
                " present out of " + record.expected + " expected.";
            container.appendChild(item);
        });
    }

    // NAVIGATION

    document.querySelectorAll(".nav-link").forEach(function (link) {
        link.addEventListener("click", function () {
            document.querySelectorAll(".nav-link").forEach(function (item) {
                item.classList.remove("active");
            });

            link.classList.add("active");
            document.getElementById("sidebar").classList.remove("open");
        });
    });

    document.getElementById("menuButton").addEventListener("click", function () {
        document.getElementById("sidebar").classList.toggle("open");
    });

    // LOG OUT

    document.getElementById("logoutButton").addEventListener("click", function () {
        if (confirm("Are you sure you want to log out?")) {
            sessionStorage.removeItem("smartAttendLoggedInLecturer");
            window.location.href = "lecturer-login.html";
        }
    });

    function createId() {
        if (window.crypto && typeof window.crypto.randomUUID === "function") {
            return window.crypto.randomUUID();
        }

        return "session-" + Date.now() + "-" +
            Math.random().toString(36).slice(2, 10);
    }

    function refreshIcons() {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // INITIALISE DASHBOARD

    renderCourses();
    renderSessions();
    renderAttendance();
    updateStats();
    refreshIcons();
}