document.addEventListener("DOMContentLoaded", function () {
    // 1. Get saved courses from My Courses
    const STORAGE_KEY = "smartAttendCourses";
    const ATTENDANCE_KEY = "smartAttendAttendance";

    const totalClasses = document.getElementById("totalClasses");
    const classesAttended = document.getElementById("classesAttended");
    const classesMissed = document.getElementById("classesMissed");
    const attendanceRate = document.getElementById("attendanceRate");

    const classesSection = document.getElementById("classes");
    const emptyState = document.querySelector("#classes .empty-state");

    let courses = [];
    let attendanceRecords = [];

    try {
        courses = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        attendanceRecords =
            JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];

        if (!Array.isArray(courses)) courses = [];
        if (!Array.isArray(attendanceRecords)) attendanceRecords = [];
    } catch (error) {
        console.error("Could not load saved dashboard data:", error);
    }

    // 2. Create a place to display saved courses
    let courseList = document.getElementById("dashboardCourseList");

    if (!courseList && classesSection) {
        courseList = document.createElement("div");
        courseList.id = "dashboardCourseList";

        const heading = classesSection.querySelector(".panel-heading");

        if (heading) {
            heading.insertAdjacentElement("afterend", courseList);
        } else {
            classesSection.appendChild(courseList);
        }
    }

    // 3. Display courses on the dashboard
    function displayCourses() {
        if (!courseList) return;

        courseList.replaceChildren();

        if (courses.length === 0) {
            if (emptyState) emptyState.style.display = "block";
            return;
        }

        if (emptyState) emptyState.style.display = "none";

        courses.forEach(function (course) {
            const card = document.createElement("div");
            card.className = "dashboard-course-card";

            const name = document.createElement("h3");
            name.textContent = course.name || "Unnamed course";

            const code = document.createElement("p");
            code.textContent = "Course code: " + (course.code || "Not provided");

            const day = document.createElement("p");
            day.textContent = "Day: " + (course.day || "Not provided");

            const time = document.createElement("p");
            time.textContent =
                "Time: " + (course.startTime || "--:--") +
                " – " + (course.endTime || "--:--");

            const venue = document.createElement("p");
            venue.textContent = "Venue: " + (course.venue || "Not provided");

            card.append(name, code, day, time, venue);
            courseList.appendChild(card);
        });
    }

    // 4. Update dashboard statistics
    function updateStatistics() {
        const attended = attendanceRecords.length;
        const missed = 0;
        const rate = attended > 0
            ? Math.round((attended / (attended + missed)) * 100)
            : 0;

        if (totalClasses) {
            totalClasses.textContent = courses.length;
        }

        if (classesAttended) {
            classesAttended.textContent = attended;
        }

        if (classesMissed) {
            classesMissed.textContent = missed;
        }

        if (attendanceRate) {
            attendanceRate.textContent = rate + "%";
        }
    }

    displayCourses();
    updateStatistics();

    // 5. Connect the Scan Attendance button to the QR scanner
    const scanButton = document.getElementById("scanButton");
    const scanMessage = document.getElementById("scanMessage");

    let qrScanner = null;

    if (scanButton) {
        scanButton.addEventListener("click", async function () {
            if (typeof Html5Qrcode === "undefined") {
                if (scanMessage) {
                    scanMessage.textContent =
                        "QR scanner library not loaded. Check your internet connection.";
                }
                return;
            }

            if (qrScanner) return;

            const reader = document.getElementById("qr-reader");

            if (!reader) {
                if (scanMessage) {
                    scanMessage.textContent =
                        "Please add the qr-reader container to your dashboard HTML.";
                }
                return;
            }

            qrScanner = new Html5Qrcode("qr-reader");

            if (scanMessage) {
                scanMessage.textContent =
                    "Starting camera. Please allow camera access.";
            }

            try {
                await qrScanner.start(
                    { facingMode: "environment" },
                    {
    fps: 15,
    qrbox: function (viewfinderWidth, viewfinderHeight) {
        const size = Math.floor(
            Math.min(viewfinderWidth, viewfinderHeight) * 0.75
        );

        return {
            width: size,
            height: size
        };
    }
},

                    async function (decodedText) {
                        if (scanMessage) {
                            scanMessage.textContent =
                                "QR code scanned. Verification is not yet connected.";
                        }

                        try {
                            await qrScanner.stop();
                            qrScanner.clear();
                        } catch (error) {
                            console.error("Could not stop scanner:", error);
                        }

                        qrScanner = null;
                    },

                    function () {
                        // Wait until a QR code is detected.
                    }
                );

                if (scanMessage) {
                    scanMessage.textContent =
                        "Camera ready. Point it at the class QR code.";
                }
            } catch (error) {
                if (scanMessage) {
                    scanMessage.textContent =
                        "Camera could not start. Allow camera access and try again.";
                }

                qrScanner = null;
                console.error("Scanner error:", error);
            }
        });
    }

    // 6. Connect the Log Out links
    document.querySelectorAll('a[href="login.html"]').forEach(function (link) {
        if (link.textContent.trim().toLowerCase().includes("log out")) {
            link.addEventListener("click", function () {
                // This is only a navigation action; real authentication
                // and session logout must be implemented separately.
            });
        }
    });
});



/* Personalize the student dashboard greeting */
const studentWelcome = document.getElementById("studentWelcome");

const loggedInStudent = JSON.parse(
    sessionStorage.getItem("smartAttendLoggedInStudent")
);

if (studentWelcome && loggedInStudent && loggedInStudent.name) {
    const firstName = loggedInStudent.name.trim().split(/\s+/)[0];
    studentWelcome.textContent = `Welcome, ${firstName} 👋`;
}