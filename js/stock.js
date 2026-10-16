// ELEMENTOS

const cuerpoStock = document.querySelector(".tabla-stock tbody");

const modalLibro      = document.getElementById("modalLibro");
const formLibro       = document.getElementById("formLibro");
const libIsbn         = document.getElementById("libIsbn");
const libTitulo       = document.getElementById("libTitulo");
const libUbicacion    = document.getElementById("libUbicacion");
const errorLibro      = document.getElementById("errorLibro");

const modalEjemplares = document.getElementById("modalEjemplares");
const tituloEjemplares = document.getElementById("tituloEjemplares");
const cuerpoEjemplares = document.getElementById("cuerpoEjemplares");

const modalEditarEjemplar  = document.getElementById("modalEditarEjemplar");
const formEjemplar         = document.getElementById("formEjemplar");
const tituloEditarEjemplar = document.getElementById("tituloEditarEjemplar");
const eeEstado             = document.getElementById("eeEstado");
const eeUbicacion          = document.getElementById("eeUbicacion");
const errorEjemplar        = document.getElementById("errorEjemplar");

let filaLibro = null;
let filaEjemplares = null;
let indiceEjemplar = null;

// Minúsculas y sin tildes

const normalizar = (t) => String(t ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Evita que un texto inyecte HTML

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

// DATOS DE EJEMPLARES (datos ilustrativos, por ISBN)

const ejemplares = {
    "978-84-663-1234-5": [
        { n: 1, estado: "Préstamo",   ubicacion: "Juan P. (DNI 34.567.890)" },
        { n: 2, estado: "Disponible", ubicacion: "Pasillo C - Estante 3" },
        { n: 3, estado: "Disponible", ubicacion: "Pasillo C - Estante 3" },
        { n: 4, estado: "Pendiente",  ubicacion: "María G. (DNI 12.345.678)" },
        { n: 5, estado: "Disponible", ubicacion: "Pasillo C - Estante 3" }
    ]
};

// Para los demás libros se generan tantos ejemplares como indique su stock
function crearEjemplares(cantidad, ubicacion) {
    return Array.from({ length: cantidad }, (_, i) => ({
        n: i + 1, estado: "Disponible", ubicacion
    }));
}

// Datos de una fila de libro

const isbnDe   = (fila) => fila.dataset.isbn;
const tituloDe = (fila) => fila.cells[1].textContent.trim();
const estadoDe = (fila) => fila.cells[2].textContent.trim();

// STOCK Y ESTADO DEL LIBRO (se calculan con sus ejemplares activos)

function actualizarLibro(fila) {
    const activos = (ejemplares[isbnDe(fila)] || [])
        .filter((e) => e.estado !== "Inactivo").length;

    let texto = "Disponible";
    let clase = "estado-disponible";

    if (activos === 0) {
        texto = "Inactivo";
        clase = "estado-inactivo";
    } else if (activos === 1) {
        texto = "Último Ejemplar";
        clase = "estado-ultimo";
    }

    fila.cells[4].textContent = activos;

    const etiqueta = fila.querySelector(".estado");
    etiqueta.textContent = texto;
    etiqueta.className = "estado " + clase;
}

// EDITAR LIBRO (ISBN, título y ubicación habitual)

function abrirEdicionLibro(fila) {
    filaLibro = fila;

    libIsbn.value      = isbnDe(fila);
    libTitulo.value    = tituloDe(fila);
    libUbicacion.value = fila.cells[3].textContent.trim();
    errorLibro.textContent = "";

    modalLibro.showModal();
}

function guardarLibro() {
    const isbn      = libIsbn.value.trim();
    const titulo    = libTitulo.value.trim();
    const ubicacion = libUbicacion.value.trim();

    if (!/^[0-9-]{10,17}$/.test(isbn)) {
        errorLibro.textContent = "Ingresá un ISBN válido (solo números y guiones).";
        return;
    }
    if (!titulo) {
        errorLibro.textContent = "Ingresá el título del libro.";
        return;
    }
    if (!ubicacion) {
        errorLibro.textContent = "Ingresá la ubicación habitual.";
        return;
    }

    // El ISBN no puede repetirse con otro libro
    const repetido = Array.from(cuerpoStock.querySelectorAll("tr"))
        .some((f) => f !== filaLibro && isbnDe(f) === isbn);

    if (repetido) {
        errorLibro.textContent = "Ya existe un libro con ese ISBN.";
        return;
    }

    // Si cambió el ISBN, los ejemplares pasan a colgar del nuevo
    const isbnViejo = isbnDe(filaLibro);
    if (isbnViejo !== isbn) {
        ejemplares[isbn] = ejemplares[isbnViejo];
        delete ejemplares[isbnViejo];
        filaLibro.dataset.isbn = isbn;
    }

    filaLibro.cells[0].textContent = isbn;
    filaLibro.cells[1].textContent = titulo;
    filaLibro.cells[3].textContent = ubicacion;

    modalLibro.close();
    filaLibro = null;
}

document.getElementById("btnGuardarLibro").addEventListener("click", guardarLibro);

document.getElementById("btnCancelarLibro").addEventListener("click", () => {
    modalLibro.close();
    filaLibro = null;
});

// Enter dentro del formulario guarda en lugar de cerrar el modal
formLibro.addEventListener("submit", (e) => {
    e.preventDefault();
    guardarLibro();
});

// MODAL DE EJEMPLARES

function pintarEjemplares() {
    const lista  = ejemplares[isbnDe(filaEjemplares)] || [];
    const titulo = esc(tituloDe(filaEjemplares));

    if (lista.length === 0) {
        cuerpoEjemplares.innerHTML =
            `<tr><td colspan="5">Este libro no tiene ejemplares registrados.</td></tr>`;
        return;
    }

    cuerpoEjemplares.innerHTML = lista.map((e, i) => `
        <tr data-i="${i}">
            <td>#${String(e.n).padStart(3, "0")}</td>
            <td>${titulo}</td>
            <td><span class="estado estado-${normalizar(e.estado)}">${e.estado}</span></td>
            <td>${esc(e.ubicacion)}</td>
            <td class="celda-acciones">
                <button type="button" class="btn-icono" aria-label="Editar ejemplar"><i class="fa-regular fa-pen-to-square"></i></button>
                <button type="button" class="btn-icono" aria-label="Eliminar ejemplar" ${e.estado === "Inactivo" ? "disabled" : ""}><i class="fa-regular fa-trash-can"></i></button>
            </td>
        </tr>
    `).join("");
}

function abrirEjemplares(fila) {
    filaEjemplares = fila;
    tituloEjemplares.textContent = "Ejemplares de " + tituloDe(fila);
    pintarEjemplares();
    modalEjemplares.showModal();
}

document.getElementById("btnCerrarEjemplares").addEventListener("click", () => {
    modalEjemplares.close();
    filaEjemplares = null;
});

// Eliminar ejemplar (baja lógica) y editar ejemplar (estado y ubicación)

cuerpoEjemplares.addEventListener("click", (e) => {
    const boton = e.target.closest("button.btn-icono");
    if (!boton) return;

    const indice = Number(boton.closest("tr").dataset.i);
    const lista  = ejemplares[isbnDe(filaEjemplares)];
    const accion = boton.getAttribute("aria-label");

    if (accion === "Eliminar ejemplar") {
        const n = String(lista[indice].n).padStart(3, "0");
        if (!confirm("¿Dar de baja el ejemplar #" + n + "? Su estado pasará a Inactivo.")) return;

        lista[indice].estado = "Inactivo";
        pintarEjemplares();
        actualizarLibro(filaEjemplares);
    }

    if (accion === "Editar ejemplar") {
        indiceEjemplar = indice;

        tituloEditarEjemplar.textContent =
            "Editar ejemplar #" + String(lista[indice].n).padStart(3, "0");
        eeEstado.value    = lista[indice].estado;
        eeUbicacion.value = lista[indice].ubicacion;
        errorEjemplar.textContent = "";

        modalEditarEjemplar.showModal();
    }
});

function guardarEjemplar() {
    const ubicacion = eeUbicacion.value.trim();

    if (!ubicacion) {
        errorEjemplar.textContent = "Ingresá la ubicación o el responsable.";
        return;
    }

    const ejemplar = ejemplares[isbnDe(filaEjemplares)][indiceEjemplar];
    ejemplar.estado    = eeEstado.value;
    ejemplar.ubicacion = ubicacion;

    modalEditarEjemplar.close();
    indiceEjemplar = null;
    pintarEjemplares();
    actualizarLibro(filaEjemplares);
}

document.getElementById("btnGuardarEjemplar").addEventListener("click", guardarEjemplar);

document.getElementById("btnCancelarEjemplar").addEventListener("click", () => {
    modalEditarEjemplar.close();
    indiceEjemplar = null;
});

formEjemplar.addEventListener("submit", (e) => {
    e.preventDefault();
    guardarEjemplar();
});

// BOTONES DE CADA LIBRO (un solo listener para toda la tabla)

cuerpoStock.addEventListener("click", (e) => {
    const boton = e.target.closest("button.btn-icono");
    if (!boton) return;

    const fila = boton.closest("tr");
    const accion = boton.getAttribute("aria-label");

    if (accion === "Ver ejemplares") abrirEjemplares(fila);
    if (accion === "Editar")         abrirEdicionLibro(fila);
});

// Función de cierre de sesión

document.getElementById("btnSalir").addEventListener("click", () => {
    window.location.href = "login.html";
});

// ESTADO INICIAL

cuerpoStock.querySelectorAll("tr").forEach((fila) => {
    const isbn = fila.cells[0].textContent.trim();
    fila.dataset.isbn = isbn;

    if (!ejemplares[isbn]) {
        ejemplares[isbn] = crearEjemplares(
            parseInt(fila.cells[4].textContent, 10) || 0,
            fila.cells[3].textContent.trim()
        );
    }

    fila.querySelector(".celda-acciones").insertAdjacentHTML("afterbegin",
        `<button type="button" class="btn-icono" aria-label="Ver ejemplares"><i class="fa-solid fa-layer-group"></i></button>`
    );

    const btnEliminar = fila.querySelector('button[aria-label="Eliminar"]');
    if (btnEliminar) btnEliminar.remove();
});