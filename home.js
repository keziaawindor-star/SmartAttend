document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 1. FEATURE SHOWCASE
    // =====================================

    const features = [
        {
            icon: "📷",
            tag: "FAST & SIMPLE",
            title: "Instant QR Check-in",
            description:
                "Scan a session QR code to record attendance quickly and conveniently."
        },
        {
            icon: "📊",
            tag: "TRACK YOUR PROGRESS",
            title: "Attendance Insights",
            description:
                "View your attendance records and understand your class attendance patterns."
        },
        {
            icon: "📚",
            tag: "STAY ORGANIZED",
            title: "Manage Your Courses",
            description:
                "Keep your courses organized and make it easier to keep track of your classes."
        },
        {
            icon: "🔒",
            tag: "YOUR ACCOUNT",
            title: "Personal Student Profile",
            description:
                "Access your student information and manage your profile in one convenient place."
        }
    ];

    let currentFeature = 0;

    const featureIcon = document.getElementById("featureIcon");
    const featureTag = document.getElementById("featureTag");
    const featureTitle = document.getElementById("featureTitle");
    const featureDescription =
        document.getElementById("featureDescription");

    const prevButton = document.getElementById("prevFeature");
    const nextButton = document.getElementById("nextFeature");
    const featureDots = document.querySelectorAll(".feature-dot");

    function showFeature(index) {
    currentFeature = (index + features.length) % features.length;

    const showcase = document.getElementById("featureShowcase");

    function updateFeature() {
        const feature = features[currentFeature];

        if (featureIcon) featureIcon.textContent = feature.icon;
        if (featureTag) featureTag.textContent = feature.tag;
        if (featureTitle) featureTitle.textContent = feature.title;
        if (featureDescription) {
            featureDescription.textContent = feature.description;
        }

        featureDots.forEach(function (dot, dotIndex) {
            const isActive = dotIndex === currentFeature;

            dot.classList.toggle("active", isActive);
            dot.setAttribute("aria-pressed", String(isActive));
        });

        if (showcase) {
            showcase.classList.remove("feature-changing");
        }
    }

    if (showcase) {
        showcase.classList.add("feature-changing");
        setTimeout(updateFeature, 400);
    } else {
        updateFeature();
    }
}

    if (prevButton) {
        prevButton.addEventListener("click", function () {
            showFeature(currentFeature - 1);
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", function () {
            showFeature(currentFeature + 1);
        });
    }

    featureDots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showFeature(index);
        });
    });

    // Start with the first feature.
showFeature(0);

// Automatically switch features every 4 seconds.
let featureTimer = setInterval(function () {
    showFeature(currentFeature + 1);
}, 4000);

// Pause the automatic slideshow when the user hovers over it.
const showcase = document.getElementById("featureShowcase");

if (showcase) {
    showcase.addEventListener("mouseenter", function () {
        clearInterval(featureTimer);
    });

    showcase.addEventListener("mouseleave", function () {
        clearInterval(featureTimer);

        featureTimer = setInterval(function () {
            showFeature(currentFeature + 1);
        }, 4000);
    });
}


    // =====================================
    // 2. QR CHECK-IN BUTTON
    // =====================================

    const qrButton = document.getElementById("qrButton");

    if (qrButton) {
        qrButton.addEventListener("click", function () {
            const savedSession = sessionStorage.getItem(
                "smartAttendLoggedInStudent"
            );

            if (savedSession) {
                // Student has a session: open the dashboard's scan section.
                window.location.href =
                    "student%20dashboard.html#scan";
            } else {
                // Student needs to sign in first.
                window.location.href = "login.html";
            }
        });
    }


    // =====================================
    // 3. NAVIGATION LINKS
    // =====================================

    const studentLinks = document.querySelectorAll(
        'a[href="student dashboard.html"]'
    );

    studentLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {
            const savedSession = sessionStorage.getItem(
                "smartAttendLoggedInStudent"
            );

            if (!savedSession) {
                event.preventDefault();
                window.location.href = "login.html";
            }
        });
    });


    // =====================================
    // 4. UPDATE LOGIN LINKS
    // =====================================

    const loginLinks = document.querySelectorAll(
        'a[href="login.html"]'
    );

    loginLinks.forEach(function (link) {
        const savedSession = sessionStorage.getItem(
            "smartAttendLoggedInStudent"
        );

        if (savedSession && link.textContent.trim().toLowerCase() === "get started") {
            link.href = "student%20dashboard.html";
            link.textContent = "My Dashboard";
        }
    });


    // =====================================
    // 5. SMOOTH SCROLL FOR PAGE SECTIONS
    // =====================================

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (event) {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (target) {
                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

});