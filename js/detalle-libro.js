/* ============ DATOS (acá iría nuestra API en caso de que la llegaramos a hacer) ============ */

const isbnSeleccionado = new URLSearchParams(window.location.search).get("isbn");
const libro = isbnSeleccionado ? buscarLibro(isbnSeleccionado) : null;

// DEBERIA TRAER LOS DATOS DE LOS FORMULARIOS QUE SE CARGUEN

const reviews = [
    { titulo: "Review title", texto: "Review body", nombre: "Reviewer name", fecha: "Date", estrellas: 0 },
    { titulo: "Review title", texto: "Review body", nombre: "Reviewer name", fecha: "Date", estrellas: 0 },
    { titulo: "Review title", texto: "Review body", nombre: "Reviewer name", fecha: "Date", estrellas: 0 }
];

// ELEMENTOS 

const $ = (id) => document.getElementById(id);

const btnFavorito = $("btnFavorito");
const btnPrestamo = $("btnPrestamo");
const mensaje     = $("mensaje");
const inputs      = [$("dia"), $("mes"), $("anio")];


// RENDER DEL LIBRO

function mostrarLibro() {

    // Si no existe, ocultar todo y mostrar el aviso
    if (!libro) {
        document.querySelector(".libro").hidden = true;
        document.querySelector(".reviews").hidden = true;
        $("noEncontrado").hidden = false;
        return;
    }

    $("titulo").textContent       = libro.titulo;
    $("autor").textContent        = libro.autor;
    $("isbn").textContent         = libro.isbn;
    $("editorial").textContent    = libro.editorial;
    $("categoria").textContent    = libro.categoria;
    $("fechaIngreso").textContent = libro.fechaIngreso;
    $("descripcion").textContent  = libro.descripcion || "Este libro todavía no tiene descripción.";

    if (libro.portada) {
        $("portada").src = libro.portada;
    } else {
        $("portada").style.background = "#e3e3e3";
    }

    $("estadoTexto").textContent = libro.disponible ? "Disponible" : "No disponible";
    $("estado").classList.toggle("no-disponible", !libro.disponible);
    btnPrestamo.disabled = !libro.disponible;
}

// Render de reseñas

function mostrarReviews() {
    $("reviewsGrid").innerHTML = reviews.map((r) => {
        const estrellas = Array.from({ length: 5 }, (_, i) =>
            `<i class="${i < r.estrellas ? "fa-solid" : "fa-regular"} fa-star"></i>`
        ).join("");

        return `
            <td class="review">
                <div class="estrellas">${estrellas}</div>
                <h3>${r.titulo}</h3>
                <p>${r.texto}</p>
                <div class="reviewer">
                    <img src="img/avatar.jpg" alt="" onerror="this.style.visibility='hidden'">
                    <div>
                        <strong>${r.nombre}</strong>
                        <small>${r.fecha}</small>
                    </div>
                </div>
            </td>`;
    }).join("");
}

//Botón de favorito

btnFavorito.addEventListener("click", () => {
    btnFavorito.classList.toggle("activo");
});

// ACORDEÓN 

$("acordeonBtn").addEventListener("click", () => {
    $("acordeon").classList.toggle("abierto");
});

// Fecha de retiro 

inputs.forEach((input, i) => {
    input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "");
        input.classList.remove("error");

        if (input.value.length === input.maxLength && inputs[i + 1]) {
            inputs[i + 1].focus();
        }
    });
});

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = "mensaje " + tipo;
}

function validarFecha() {
    const dia  = parseInt($("dia").value, 10);
    const mes  = parseInt($("mes").value, 10);
    const anio = parseInt($("anio").value, 10);

    if (!dia || !mes || !anio || $("anio").value.length !== 4) {
        return { error: "Completá día, mes y año." };
    }

    const fecha = new Date(anio, mes - 1, dia);

    // Detecta fechas inexistentes
    const existe =
        fecha.getFullYear() === anio &&
        fecha.getMonth() === mes - 1 &&
        fecha.getDate() === dia;

    if (!existe) {
        return { error: "La fecha no existe." };
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fecha <= hoy) {
        return { error: "La fecha de retiro debe ser posterior a hoy." };
    }

    return { fecha };
}

btnPrestamo.addEventListener("click", () => {
    const resultado = validarFecha();

    if (resultado.error) {
        inputs.forEach((i) => i.classList.add("error"));
        mostrarMensaje(resultado.error, "error");
        return;
    }

    mostrarMensaje(
        "Préstamo solicitado. Devolución: " +
        resultado.fecha.toLocaleDateString("es-UY"),
        "ok"
    );
});

//Función de cierre de sesión
const btnSalir = document.getElementById("btnSalir");

btnSalir.addEventListener("click", function () {
    window.location.href = "login.html";
});

mostrarLibro();
if (libro) mostrarReviews();