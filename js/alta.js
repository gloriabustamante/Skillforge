const zonaImagen = document.getElementById("zonaImagen");
const archivoImagen = document.getElementById("archivoImagen");
const preview = document.getElementById("preview");
const contenidoImagen = document.getElementById("contenidoImagen");

let portadaGuardada = "";

// Carga de imagenes 

function procesarImagen(archivo) {
    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
        alert("Por ahora solo se aceptan imágenes JPG o PNG.");
        return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
        alert("La imagen no puede superar los 5 MB");
        archivoImagen.value = "";
        return;
    }

    const lector = new FileReader();

    lector.onload = function (evento) {
        const img = new Image();

        img.onload = function () {
            const escala = Math.min(1, 600 / img.width);
            const canvas = document.createElement("canvas");
            canvas.width = img.width * escala;
            canvas.height = img.height * escala;
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);

            portadaGuardada = canvas.toDataURL("image/jpeg", 0.8);

            preview.src = portadaGuardada;
            preview.style.display = "block";
            contenidoImagen.style.display = "none";
        };

        img.src = evento.target.result;
    };

    lector.readAsDataURL(archivo);
}

zonaImagen.addEventListener("click", function () {
    archivoImagen.click();
});

archivoImagen.addEventListener("change", function () {
    procesarImagen(archivoImagen.files[0]);
});

zonaImagen.addEventListener("dragover", function (evento) {
    evento.preventDefault();
});

zonaImagen.addEventListener("drop", function (evento) {
    evento.preventDefault();
    procesarImagen(evento.dataTransfer.files[0]);
});


// Validaciones 

function isbnValido(valor) {
    const limpio = valor.replace(/-/g, "");
    return /^\d{13}$/.test(limpio) || /^\d{9}[\dXx]$/.test(limpio);
}

function fechaHoy() {
    return new Date().toLocaleDateString("es-UY");
}

// Botón de Guardar

const btnGuardar = document.getElementById("btnGuardar");

btnGuardar.addEventListener("click", function () {

    const isbn = document.getElementById("isbn").value.trim();
    const titulo = document.getElementById("titulo").value.trim();
    const autor = document.getElementById("autor").value.trim();
    const editorial = document.getElementById("editorial").value.trim();
    const categoria = document.getElementById("categoria").value;
    const fecha = document.getElementById("fecha").value.trim();
    const ejemplares = parseInt(document.getElementById("ejemplares").value, 10);
    const disponibilidad = document.getElementById("disponibilidad").value;

    if (!isbn || !titulo || !autor || !categoria) {
        alert("Completá ISBN, título, autor y categoría.");
        return;
    }

    if (!isbnValido(isbn)) {
        alert("El ISBN no es válido (10 o 13 dígitos).");
        return;
    }

    if (buscarLibro(isbn)) {
        alert("Ya existe un libro con ese ISBN.");
        return;
    }

    if (!ejemplares || ejemplares < 1) {
        alert("El número de ejemplares debe ser al menos 1.");
        return;
    }

    const libro = {
        isbn: isbn,
        titulo: titulo,
        autor: autor,
        editorial: editorial || "-",
        categoria: categoria,
        fechaIngreso: fecha || fechaHoy(),
        ejemplares: ejemplares,
        disponible: disponibilidad === "Disponible",
        portada: portadaGuardada,
        descripcion: document.getElementById("descripcion").value.trim()
    };

    if (!guardarLibro(libro)) {
        alert("No se pudo guardar: el almacenamiento está lleno. Probá con una imagen más chica.");
        return;
    }

    window.location.href = "detalle.html?isbn=" + encodeURIComponent(isbn);
});

// Botón de cancelar

document.getElementById("btnCancelar").addEventListener("click", function () {
    if (confirm("¿Querés cancelar y borrar los datos?")) {
        location.reload();
    }
});


//Función de cierre de sesión

document.getElementById("btnSalir").addEventListener("click", function () {
    window.location.href = "login.html";
});