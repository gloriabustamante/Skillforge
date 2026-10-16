// ELEMENTOS

const buscarUsuario = document.getElementById("buscarUsuario");
const filtroRol     = document.getElementById("filtroRol");
const filtroEstado  = document.getElementById("filtroEstado");
const listaUsuarios = document.getElementById("listaUsuarios");
const resumen       = document.getElementById("resumenUsuarios");

const modalUsuario  = document.getElementById("modalUsuario");
const formUsuario   = document.getElementById("formUsuario");
const usuNombre     = document.getElementById("usuNombre");
const usuCorreo     = document.getElementById("usuCorreo");
const usuRol        = document.getElementById("usuRol");
const usuEstado     = document.getElementById("usuEstado");
const errorUsuario  = document.getElementById("errorUsuario");

let filaEditando = null;

// Minúsculas y sin tildes

const normalizar = (t) => String(t ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Datos de una fila

const nombreDe = (fila) => fila.querySelector("strong").textContent;
const correoDe = (fila) => fila.cells[0].querySelector("span").textContent;

// Fila de "sin resultados" (se crea una sola vez)

const filaVacia = document.createElement("tr");
filaVacia.innerHTML = `<td colspan="5">No se encontraron usuarios.</td>`;
filaVacia.style.display = "none";
listaUsuarios.appendChild(filaVacia);

// FILTRAR

function filtrarUsuarios() {
    const texto  = normalizar(buscarUsuario.value).trim();
    const rol    = filtroRol.value;
    const estado = filtroEstado.value;

    // Se buscan las filas en cada llamada, así incluye las que se agreguen después
    const filas = Array.from(listaUsuarios.querySelectorAll("tr")).filter((f) => f !== filaVacia);
    let visibles = 0;

    filas.forEach((fila) => {
        const contenido = normalizar(
            [fila.cells[0], fila.cells[1], fila.cells[2]].map((c) => c.textContent).join(" ")
        );

        const coincideTexto  = !texto  || contenido.includes(texto);
        const coincideRol    = !rol    || fila.dataset.rol === rol;
        const coincideEstado = !estado || fila.dataset.estado === estado;

        const mostrar = coincideTexto && coincideRol && coincideEstado;
        fila.style.display = mostrar ? "" : "none";
        if (mostrar) visibles++;
    });

    filaVacia.style.display = visibles === 0 ? "" : "none";

    if (resumen) {
        resumen.textContent = `Mostrando ${visibles} de ${filas.length} usuarios`;
    }
}

buscarUsuario.addEventListener("input", filtrarUsuarios);
filtroRol.addEventListener("change", filtrarUsuarios);
filtroEstado.addEventListener("change", filtrarUsuarios);

// ESTADO (etiqueta de la tabla + botón eliminar)

function aplicarEstado(fila, estado) {
    fila.dataset.estado = estado;

    const etiqueta = fila.querySelector(".estado-usuario");
    etiqueta.textContent = estado;
    etiqueta.className = "estado-usuario " + normalizar(estado);

    // Un usuario inactivo ya no se puede volver a dar de baja
    const btnEliminar = fila.querySelector('button[aria-label="Eliminar usuario"]');
    if (btnEliminar) btnEliminar.disabled = estado === "Inactivo";
}

// ELIMINAR (pasa a Inactivo, no se borra la fila)

function darDeBaja(fila) {
    if (fila.dataset.estado === "Inactivo") return;

    const confirmado = confirm(
        "¿Dar de baja a " + nombreDe(fila) + "? Su estado pasará a Inactivo."
    );
    if (!confirmado) return;

    aplicarEstado(fila, "Inactivo");
    filtrarUsuarios();
}

// EDITAR (modal con nombre, correo, rol y estado)

function abrirEdicion(fila) {
    filaEditando = fila;

    usuNombre.value = nombreDe(fila);
    usuCorreo.value = correoDe(fila);
    usuRol.value    = fila.dataset.rol;
    usuEstado.value = fila.dataset.estado;
    errorUsuario.textContent = "";

    modalUsuario.showModal();
}

function guardarEdicion() {
    const nombre = usuNombre.value.trim();
    const correo = usuCorreo.value.trim();

    if (!nombre) {
        errorUsuario.textContent = "Ingresá el nombre del usuario.";
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        errorUsuario.textContent = "Ingresá un correo válido.";
        return;
    }

    // El correo no puede repetirse con otro usuario
    const repetido = Array.from(listaUsuarios.querySelectorAll("tr"))
        .filter((f) => f !== filaVacia && f !== filaEditando)
        .some((f) => normalizar(correoDe(f)) === normalizar(correo));

    if (repetido) {
        errorUsuario.textContent = "Ya existe un usuario con ese correo.";
        return;
    }

    filaEditando.querySelector("strong").textContent = nombre;
    filaEditando.cells[0].querySelector("span").textContent = correo;
    filaEditando.cells[1].textContent = usuRol.value;
    filaEditando.dataset.rol = usuRol.value;
    aplicarEstado(filaEditando, usuEstado.value);

    modalUsuario.close();
    filaEditando = null;
    filtrarUsuarios();
}

document.getElementById("btnGuardarUsuario").addEventListener("click", guardarEdicion);

document.getElementById("btnCancelarUsuario").addEventListener("click", () => {
    modalUsuario.close();
    filaEditando = null;
});

// Enter dentro del formulario guarda en lugar de cerrar el modal

formUsuario.addEventListener("submit", (e) => {
    e.preventDefault();
    guardarEdicion();
});

// BOTONES DE CADA FILA (un solo listener para toda la tabla)

listaUsuarios.addEventListener("click", (e) => {
    const boton = e.target.closest("button.btn-icono");
    if (!boton) return;

    const fila = boton.closest("tr");
    const accion = boton.getAttribute("aria-label");

    if (accion === "Editar usuario")   abrirEdicion(fila);
    if (accion === "Eliminar usuario") darDeBaja(fila);
});

// Función de cierre de sesión

document.getElementById("btnSalir").addEventListener("click", () => {
    window.location.href = "login.html";
});

// Estado inicial
listaUsuarios.querySelectorAll("tr").forEach((fila) => {
    if (fila !== filaVacia) aplicarEstado(fila, fila.dataset.estado);
});

filtrarUsuarios();