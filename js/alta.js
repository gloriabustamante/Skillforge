
const btnSalir = document.getElementById("btnSalir");

btnSalir.addEventListener("click", function () {

    alert("Sesión cerrada");

});


const zonaImagen = document.getElementById("zonaImagen");

const archivoImagen = document.getElementById("archivoImagen");

const preview = document.getElementById("preview");

const contenidoImagen = document.getElementById("contenidoImagen");


zonaImagen.addEventListener("click", function () {

    archivoImagen.click();

});


archivoImagen.addEventListener("change", function () {

    const archivo = archivoImagen.files[0];

    if (!archivo) {
        return;
    }

    if (archivo.size > 5 * 1024 * 1024) {

        alert("La imagen no puede superar los 5 MB");

        archivoImagen.value = "";

        return;
    }


    const lector = new FileReader();

    lector.onload = function (evento) {

        preview.src = evento.target.result;

        preview.style.display = "block";

        contenidoImagen.style.display = "none";

    };

    lector.readAsDataURL(archivo);

});


zonaImagen.addEventListener("dragover", function (evento) {

    evento.preventDefault();

});


zonaImagen.addEventListener("drop", function (evento) {

    evento.preventDefault();

    const archivo = evento.dataTransfer.files[0];

    if (!archivo) {
        return;
    }

    if (archivo.size > 5 * 1024 * 1024) {

        alert("El archivo no puede superar los 5 MB");

        return;
    }

    archivoImagen.files = evento.dataTransfer.files;

    const lector = new FileReader();

    lector.onload = function (evento) {

        preview.src = evento.target.result;

        preview.style.display = "block";

        contenidoImagen.style.display = "none";

    };

    lector.readAsDataURL(archivo);

});


const btnGuardar = document.getElementById("btnGuardar");

btnGuardar.addEventListener("click", function () {

    const titulo = document.getElementById("titulo").value;

    const autor = document.getElementById("autor").value;


    if (titulo === "" || autor === "") {

        alert("Completá el título y el autor.");

        return;
    }


    alert("Libro guardado correctamente.");

});

const btnCancelar = document.getElementById("btnCancelar");

btnCancelar.addEventListener("click", function () {

    const confirmar = confirm(
        "¿Querés cancelar y borrar los datos?"
    );

    if (confirmar) {

        location.reload();

    }

});