(function () {
    const CLIENT_ID =
        "92175470588-a528h5vkc0c49c031oado66n2vkcqv8k.apps.googleusercontent.com";

    const buttonContainer = document.getElementById("lecturerGoogleButton");
    const message = document.getElementById("googleLoginMessage");

    function showMessage(text, success) {
        message.textContent = text;
        message.style.color = success ? "#0f766e" : "#dc2626";
    }

    function handleGoogleCredential(response) {
        try {
            if (!response || !response.credential) {
                showMessage("Google sign-in did not return a credential.", false);
                return;
            }

            // Decode the ID token to read its profile for this prototype.
            // This does NOT verify the token's signature.
            const parts = response.credential.split(".");

            if (parts.length !== 3) {
                throw new Error("Invalid Google credential.");
            }

            const payload = parts[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/");

            const paddedPayload = payload.padEnd(
                Math.ceil(payload.length / 4) * 4,
                "="
            );

            const profile = JSON.parse(
                decodeURIComponent(
                    Array.from(atob(paddedPayload))
                        .map(function (character) {
                            return "%" +
                                character.charCodeAt(0)
                                    .toString(16)
                                    .padStart(2, "0");
                        })
                        .join("")
                )
            );

            if (!profile.email || !profile.sub) {
                throw new Error("Google profile information is incomplete.");
            }

            if (profile.email_verified !== true) {
                showMessage("Please use a verified Google email address.", false);
                return;
            }

            const lecturer = {
                name: profile.name || "Lecturer",
                email: profile.email.toLowerCase(),
                staffId: "Google account",
                department: "Not provided",
                googleId: profile.sub,
                picture: profile.picture || ""
            };

            // Keep Google lecturer data separate from student data.
            sessionStorage.setItem(
                "smartAttendLoggedInLecturer",
                JSON.stringify(lecturer)
            );

            sessionStorage.setItem(
                "smartAttendLecturerGoogleProfile",
                JSON.stringify({
                    name: lecturer.name,
                    email: lecturer.email,
                    picture: lecturer.picture
                })
            );

            showMessage("Google sign-in successful. Opening dashboard...", true);

            window.location.href = "lecturer%20dashboard.html";

        } catch (error) {
            console.error("Lecturer Google sign-in error:", error);
            showMessage(
                "We could not complete Google sign-in. Please try again.",
                false
            );
        }
    }

    function initialiseGoogleSignIn() {
        if (!window.google || !google.accounts || !google.accounts.id) {
            showMessage(
                "Google sign-in is still loading. Refresh the page and try again.",
                false
            );
            return;
        }

        google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: handleGoogleCredential,
            auto_select: false
        });

        google.accounts.id.renderButton(buttonContainer, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: 300,
            logo_alignment: "left"
        });
    }

    // Wait for Google's library, which is loaded asynchronously.
    window.addEventListener("load", function () {
        initialiseGoogleSignIn();
    });
})();