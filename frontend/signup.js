const passwordField = document.getElementById("password");
const togglePassword = document.querySelector(".password-toggle-icon i");
const repPasswordField = document.getElementById("rep-password");
const repTogglePassword = document.querySelector(".rep-password-toggle-icon i");
const passwordSame = document.getElementById("password-same");
const passwordLength = document.getElementById("password-length");

function viewPassword() {
    const newType = passwordField.type === "password" ? "text" : "password";
    
    [passwordField, repPasswordField].forEach(field => field.type = newType);
    [togglePassword, repTogglePassword].forEach((icon) => {
        icon.classList.toggle("fa-eye-slash", newType === "text");
        icon.classList.toggle("fa-eye", newType === "password");
    });
}

function validatePassword() {
    if (passwordField.value === repPasswordField.value) {
        passwordSame.innerHTML = '<i class="bi bi-check-lg"></i>Passwords match';
    } else {
        passwordSame.innerHTML = '<i class="bi bi-x-lg"></i>Passwords do not match';
    }

    if (passwordField.value.length >= 8 && repPasswordField.value.length >= 8) {
        passwordLength.innerHTML = '<i class="bi bi-check-lg"></i>At least 8 characters long';
    } else {
        passwordLength.innerHTML = '<i class="bi bi-x-lg"></i>At least 8 characters long';
    }
}

passwordField.addEventListener("input", validatePassword);
repPasswordField.addEventListener("input", validatePassword);