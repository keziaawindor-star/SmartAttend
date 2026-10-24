document.addEventListener("DOMContentLoaded", function () {
    const avatar = document.getElementById("dashboardAvatar");

    if (!avatar) return;

    const student = JSON.parse(
        sessionStorage.getItem("smartAttendLoggedInStudent") || "{}"
    );

    const googleProfile = JSON.parse(
        sessionStorage.getItem("smartAttendGoogleProfile") || "{}"
    );

    const email = (student.email || "").toLowerCase();

    const uploadedPicture = email
        ? localStorage.getItem("smartAttendProfilePicture_" + email)
        : null;

    const picture =
        uploadedPicture ||
        googleProfile.picture ||
        student.picture ||
        "";

    function showDefaultAvatar() {
        avatar.innerHTML =
            '<span class="default-avatar">' +
            '<i data-lucide="user-round"></i>' +
            '</span>';

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    function showPicture(src) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = (student.name || "Student") + "'s profile picture";

        img.onerror = function () {
            showDefaultAvatar();
        };

        avatar.replaceChildren(img);
    }

    if (picture) {
        showPicture(picture);
    } else {
        showDefaultAvatar();
    }

    avatar.title = "View My Profile";
    avatar.setAttribute("role", "button");
    avatar.setAttribute("tabindex", "0");
    avatar.setAttribute("aria-label", "View My Profile");

    function openProfile() {
        const profile = document.getElementById("profile");

        if (profile) {
            profile.scrollIntoView({ behavior: "smooth" });
        }
    }

    avatar.addEventListener("click", openProfile);

    avatar.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openProfile();
        }
    });
});