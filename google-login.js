function handleGoogleSignIn(response) {
    if (!response || !response.credential) {
        alert("Google sign-in failed. Please try again.");
        return;
    }

    try {
        // Decode the Google ID token's payload.
        const parts = response.credential.split(".");
        const payload = JSON.parse(
            atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
        );

        if (!payload.email || !payload.sub) {
            alert("Google did not return the required account details.");
            return;
        }

        const googleStudent = {
            name: payload.name || "",
            email: payload.email,
            studentId: "",
            department: "",
            level: "",
            googleId: payload.sub,
            picture: payload.picture || ""
        };

        // Save the signed-in Google user's basic details for this session.
        sessionStorage.setItem(
            "smartAttendLoggedInStudent",
            JSON.stringify(googleStudent)
        );

        sessionStorage.setItem(
            "smartAttendGoogleProfile",
            JSON.stringify({
                email: payload.email,
                picture: payload.picture || ""
            })
        );

        // Open the existing student dashboard.
        window.location.href = "student%20dashboard.html";
    } catch (error) {
        console.error("Google sign-in error:", error);
        alert("We couldn't complete Google sign-in. Please try again.");
    }
}