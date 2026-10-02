// ================= MOSTRAR CONTRASEÑA =================

const mostrarPassword = document.getElementById("mostrarPassword");
const password = document.getElementById("password");

mostrarPassword.addEventListener("change", function () {

    if (this.checked) {

        password.type = "text";

    } else {

        password.type = "password";

    }

});


// ================= LOGIN =================

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const passwordValue = document.getElementById("password").value;

    if (email === "" || passwordValue === "") {

        alert("Completá todos los campos.");

        return;
    }

    // Por ahora solamente redirige al inicio
    window.location.href = "index.html";

});