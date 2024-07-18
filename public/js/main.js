// Function to handle form submissions
function handleSubmit(event, url) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);

  // Add reCAPTCHA token if available
  if (window.grecaptcha) {
    data.recaptchaToken = grecaptcha.getResponse();
  }

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/home";
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    });
}

// Event listeners for forms
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  const signinForm = document.getElementById("signin-form");
  const resetPasswordForm = document.getElementById("reset-password-form");
  const signoutBtn = document.getElementById("signout-btn");

  if (signupForm) {
    signupForm.addEventListener("submit", (e) =>
      handleSubmit(e, "/auth/signup")
    );
  }

  if (signinForm) {
    signinForm.addEventListener("submit", (e) =>
      handleSubmit(e, "/auth/signin")
    );
  }

  if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newPassword = e.target.newPassword.value;
      const confirmPassword = e.target.confirmPassword.value;
      if (newPassword !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
      handleSubmit(e, "/auth/reset-password");
    });
  }

  if (signoutBtn) {
    signoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "/signin";
    });
  }
});
