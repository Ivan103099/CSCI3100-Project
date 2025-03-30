const passwordField = document.getElementById("password");
const togglePassword = document.querySelector(".password-toggle-icon i");

togglePassword.addEventListener("click", function () {
    const newType = passwordField.type === "password" ? "text" : "password";
    passwordField.type = newType;
    togglePassword.classList.toggle("fa-eye-slash", newType === "text");
    togglePassword.classList.toggle("fa-eye", newType === "password");
  });