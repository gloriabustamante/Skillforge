const $ = (id) => document.getElementById(id);

const clientes = {
    "12345678": { nombre: "Ana Pérez", telefono: "099 123 456" },
    "87654321": { nombre: "Luis Gómez", telefono: "098 765 432" }
};

const documento = $("documento");
const isbn = $("isbn");
const titulo = $("titulo");
const clienteInfo = $("clienteInfo");
const mensajeForm = $("mensajeForm");
const modal = $("modalCliente");

const retiro = [$("retiroDia"), $("retiroMes"), $("retiroAnio")];
const devolucion = [$("devDia"), $("devMes"), $("devAnio")];


function soloDigitos(valor) {
    return valor.replace(/\D/g, "");
}

function marcarError(input, hayError) {
    input.classList.toggle("input-error", hayError);
}

function mostrarMensaje(texto, tipo) {
    mensajeForm.textContent = texto;
    mensajeForm.className = "mensaje-form " + (tipo || "");
}

function fechaDesdeCampos([d, m, a]) {
    const dia = Number(d.value);
    const mes = Number(m.value);
    const anio = Number(a.value);

    if (!dia || !mes || a.value.length !== 4) return null;

    const fecha = new Date(anio, mes - 1, dia);
    const valida =
        fecha.getFullYear() === anio &&
        fecha.getMonth() === mes - 1 &&
        fecha.getDate() === dia;

    return valida ? fecha : null;
}

function escribirFecha([d, m, a], fecha) {
    d.value = String(fecha.getDate()).padStart(2, "0");
    m.value = String(fecha.getMonth() + 1).padStart(2, "0");
    a.value = String(fecha.getFullYear());
}

[retiro, devolucion].forEach((grupo) => {
    grupo.forEach((input, i) => {
        input.addEventListener("input", () => {
            input.value = soloDigitos(input.value);
            marcarError(input, false);

            if (input.value.length === input.maxLength && grupo[i + 1]) {
                grupo[i + 1].focus();
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && input.value === "" && grupo[i - 1]) {
                grupo[i - 1].focus();
            }
        });
    });
});

(function precargarFechas() {
    const hoy = new Date();
    const dev = new Date();
    dev.setDate(hoy.getDate() + 7);
    escribirFecha(retiro, hoy);
    escribirFecha(devolucion, dev);
})();

//  Documento y cliente

documento.addEventListener("input", () => {
    documento.value = soloDigitos(documento.value);
    marcarError(documento, false);
    clienteInfo.textContent = "";
    clienteInfo.className = "";
});

documento.addEventListener("blur", () => {
    const doc = documento.value.trim();
    if (doc.length < 6) return;

    const cliente = clientes[doc];

    if (cliente) {
        clienteInfo.textContent = "Cliente: " + cliente.nombre;
        clienteInfo.className = "ok-texto";
    } else {
        abrirModalCliente(doc);
    }
});

function abrirModalCliente(doc) {
    $("cliDocumento").value = doc;
    $("cliNombre").value = "";
    $("cliTelefono").value = "";
    $("errorCliente").textContent = "";
    modal.showModal();
    $("cliNombre").focus();
}

$("btnCancelarCliente").addEventListener("click", () => modal.close());

$("btnGuardarCliente").addEventListener("click", () => {
    const doc = $("cliDocumento").value;
    const nombre = $("cliNombre").value.trim();
    const telefono = $("cliTelefono").value.trim();

    if (nombre.length < 3 || telefono.length < 6) {
        $("errorCliente").textContent = "Completa el nombre y un teléfono válido.";
        return;
    }

    clientes[doc] = { nombre, telefono };
    clienteInfo.textContent = "Cliente registrado: " + nombre;
    clienteInfo.className = "ok-texto";
    modal.close();
});

// Validación de ISBN

isbn.addEventListener("input", () => {
    isbn.value = isbn.value.replace(/[^0-9Xx-]/g, "");
    marcarError(isbn, false);
});

function isbnValido(valor) {
    const limpio = valor.replace(/-/g, "");
    return /^\d{13}$/.test(limpio) || /^\d{9}[\dXx]$/.test(limpio);
}

titulo.addEventListener("input", () => marcarError(titulo, false));

// Validación y guardado 

function validar() {
    let ok = true;

    if (documento.value.trim().length < 6) {
        marcarError(documento, true);
        ok = false;
    }

    if (!isbnValido(isbn.value.trim())) {
        marcarError(isbn, true);
        ok = false;
    }

    if (titulo.value.trim().length < 2) {
        marcarError(titulo, true);
        ok = false;
    }

    const fRetiro = fechaDesdeCampos(retiro);
    const fDev = fechaDesdeCampos(devolucion);

    retiro.forEach((i) => marcarError(i, !fRetiro));
    devolucion.forEach((i) => marcarError(i, !fDev));

    if (!fRetiro || !fDev) {
        mostrarMensaje("Revisa los campos marcados en rojo.", "error");
        return null;
    }

    if (fDev <= fRetiro) {
        devolucion.forEach((i) => marcarError(i, true));
        mostrarMensaje("La devolución debe ser posterior al retiro.", "error");
        return null;
    }

    if (!ok) {
        mostrarMensaje("Revisa los campos marcados en rojo.", "error");
        return null;
    }

    return { fRetiro, fDev };
}

$("btnGuardar").addEventListener("click", () => {
    mostrarMensaje("");
    const fechas = validar();
    if (!fechas) return;

    const prestamo = {
        documento: documento.value.trim(),
        isbn: isbn.value.trim(),
        titulo: titulo.value.trim(),
        retiro: fechas.fRetiro.toISOString().slice(0, 10),
        devolucion: fechas.fDev.toISOString().slice(0, 10)
    };

// Acá prestamo al backend (fetch / POST)
    console.log("Préstamo registrado:", prestamo);

    mostrarMensaje("Préstamo registrado correctamente.", "exito");
    limpiarFormulario(false);
});

// Cancelar y limpiar el formulario

function limpiarFormulario(limpiarMensaje = true) {
    [documento, isbn, titulo].forEach((i) => {
        i.value = "";
        marcarError(i, false);
    });

    clienteInfo.textContent = "";
    [...retiro, ...devolucion].forEach((i) => marcarError(i, false));

    const hoy = new Date();
    const dev = new Date();
    dev.setDate(hoy.getDate() + 7);
    escribirFecha(retiro, hoy);
    escribirFecha(devolucion, dev);

    if (limpiarMensaje) mostrarMensaje("");
}

$("btnCancelar").addEventListener("click", () => limpiarFormulario());

// BOTÓN SALIR
const btnSalir = document.getElementById("btnSalir");

btnSalir.addEventListener("click", function () {
    window.location.href = "login.html";
});