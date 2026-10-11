const $ = (id) => document.getElementById(id);
const API = "api/"; //ACÁ IRIA LA API QUE HAGAMOS 

const documento   = $("documento");
const isbn        = $("isbn");
const titulo      = $("titulo");
const clienteInfo = $("clienteInfo");
const mensajeForm = $("mensajeForm");
const modal       = $("modalCliente");

const retiro     = [$("retiroDia"), $("retiroMes"), $("retiroAnio")];
const devolucion = [$("devDia"), $("devMes"), $("devAnio")];

// UTILIDADES

async function pedir(url, opciones) {
    try {
        const respuesta = await fetch(url, opciones);
        const datos = await respuesta.json().catch(() => ({}));
        return { ok: respuesta.ok, status: respuesta.status, datos };
    } catch {
        return { ok: false, status: 0, datos: { error: "No se pudo conectar con el servidor." } };
    }
}

function enviarJSON(url, cuerpo) {
    return pedir(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo)
    });
}

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

function textoFecha(fecha) {
    const a = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, "0");
    const d = String(fecha.getDate()).padStart(2, "0");
    return `${a}-${m}-${d}`;
}


//FECHAS 

function fechaDesdeCampos([d, m, a]) {
    const dia  = Number(d.value);
    const mes  = Number(m.value);
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

// FUNCIÓN PARA CALCULAR LA FECHA 

function calcularDevolucion() {
    const fRetiro = fechaDesdeCampos(retiro);
    if (!fRetiro) return;

    const dev = new Date(fRetiro);
    dev.setDate(dev.getDate() + 7);
    escribirFecha(devolucion, dev);

    devolucion.forEach((i) => marcarError(i, false));
}

function fechasPorDefecto() {
    escribirFecha(retiro, new Date());
    calcularDevolucion();
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

// Al cambiar el retiro, se recalcula la devolución
retiro.forEach((input) => {
    input.addEventListener("input", calcularDevolucion);
});


//

documento.addEventListener("input", () => {
    documento.value = soloDigitos(documento.value);
    marcarError(documento, false);
    clienteInfo.textContent = "";
    clienteInfo.className = "";
});

documento.addEventListener("blur", async () => {
    const doc = documento.value.trim();
    if (doc.length < 6) return;

    const r = await pedir(API + "personas.php?documento=" + encodeURIComponent(doc));

    if (r.ok) {
        clienteInfo.textContent = "Cliente: " + r.datos.nombre;
        clienteInfo.className = "ok-texto";
    } else if (r.status === 404) {
        abrirModalCliente(doc);          // persona no registrada
    } else {
        mostrarMensaje(r.datos.error || "Error al buscar la persona.", "error");
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

modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
});

$("btnGuardarCliente").addEventListener("click", async () => {
    const datos = {
        documento: $("cliDocumento").value,
        nombre:    $("cliNombre").value.trim(),
        telefono:  $("cliTelefono").value.trim()
    };

    if (datos.nombre.length < 3 || datos.telefono.length < 6) {
        $("errorCliente").textContent = "Completá el nombre y un teléfono válido.";
        return;
    }

    const r = await enviarJSON(API + "personas.php", datos);

    if (!r.ok) {
        $("errorCliente").textContent = r.datos.error || "No se pudo guardar.";
        return;
    }

    clienteInfo.textContent = "Cliente registrado: " + datos.nombre;
    clienteInfo.className = "ok-texto";
    modal.close();
});


/* ============ ISBN Y TÍTULO ============ */

function isbnValido(valor) {
    const limpio = valor.replace(/-/g, "");
    return /^\d{13}$/.test(limpio) || /^\d{9}[\dXx]$/.test(limpio);
}

isbn.addEventListener("input", () => {
    isbn.value = isbn.value.replace(/[^0-9Xx-]/g, "");
    marcarError(isbn, false);
    titulo.value = "";
});

// Al salir del campo, busca el libro y completa el título

isbn.addEventListener("blur", async () => {
    const valor = isbn.value.trim();
    if (!isbnValido(valor)) return;

    const r = await pedir(API + "libros.php?isbn=" + encodeURIComponent(valor));

    if (!r.ok) {
        marcarError(isbn, true);
        mostrarMensaje("No existe un libro con ese ISBN.", "error");
        return;
    }

    titulo.value = r.datos.titulo;
    marcarError(titulo, false);

    if (!Number(r.datos.disponible) || r.datos.libres < 1) {
        marcarError(isbn, true);
        mostrarMensaje("Este libro no tiene ejemplares disponibles.", "error");
    } else {
        mostrarMensaje("");
    }
});


//GUARDADO

function validar() {
    let ok = true;

    if (documento.value.trim().length < 6) { marcarError(documento, true); ok = false; }
    if (!isbnValido(isbn.value.trim()))    { marcarError(isbn, true);      ok = false; }
    if (titulo.value.trim() === "")        { marcarError(titulo, true);    ok = false; }

    const fRetiro = fechaDesdeCampos(retiro);
    const fDev    = fechaDesdeCampos(devolucion);

    retiro.forEach((i)     => marcarError(i, !fRetiro));
    devolucion.forEach((i) => marcarError(i, !fDev));

    if (!ok || !fRetiro || !fDev) {
        mostrarMensaje("Revisá los campos marcados en rojo.", "error");
        return null;
    }

    if (fDev <= fRetiro) {
        devolucion.forEach((i) => marcarError(i, true));
        mostrarMensaje("La devolución debe ser posterior al retiro.", "error");
        return null;
    }

    return { fRetiro, fDev };
}

$("btnGuardar").addEventListener("click", async () => {
    mostrarMensaje("");

    const fechas = validar();
    if (!fechas) return;

    const r = await enviarJSON(API + "prestamos.php", {
        documento:  documento.value.trim(),
        isbn:       isbn.value.trim(),
        retiro:     textoFecha(fechas.fRetiro),
        devolucion: textoFecha(fechas.fDev)
    });

    if (!r.ok) {
        mostrarMensaje(r.datos.error || "No se pudo registrar el préstamo.", "error");
        return;
    }

    limpiarFormulario(false);
    mostrarMensaje(r.datos.mensaje, "exito");
});


//CANCELAR

function limpiarFormulario(limpiarMensaje = true) {
    [documento, isbn, titulo].forEach((i) => {
        i.value = "";
        marcarError(i, false);
    });

    clienteInfo.textContent = "";
    [...retiro, ...devolucion].forEach((i) => marcarError(i, false));
    fechasPorDefecto();

    if (limpiarMensaje) mostrarMensaje("");
}

$("btnCancelar").addEventListener("click", () => limpiarFormulario());

fechasPorDefecto();