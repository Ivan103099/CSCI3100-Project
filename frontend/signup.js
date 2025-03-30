const passwordField = document.getElementById("password");
const togglePassword = document.querySelector(".password-toggle-icon i");
const repPasswordField = document.getElementById("rep-password");
const repTogglePassword = document.querySelector(".rep-password-toggle-icon i");

function viewPassword() {
    const newType = passwordField.type === "password" ? "text" : "password";
    
    [passwordField, repPasswordField].forEach(field => field.type = newType);
    [togglePassword, repTogglePassword].forEach((icon) => {
        icon.classList.toggle("fa-eye-slash", newType === "text");
        icon.classList.toggle("fa-eye", newType === "password");
    });
}


