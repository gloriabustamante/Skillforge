const form        = document.querySelector(".formulario");
const mensajeForm = document.getElementById("mensajeForm");
const selectLibro = document.getElementById("libro");
const inputAutor  = document.getElementById("autor");

// Llena el select con el catálogo (ordenado alfabéticamente)
[...libros]
    .sort((a, b) => a.titulo.localeCompare(b.titulo, "es"))
    .forEach((l) => {
        const op = document.createElement("option");
        op.value = l.isbn;
        op.textContent = l.titulo;
        selectLibro.appendChild(op);
    });

// Preeselecciona al venir del ISBN del libro
const isbnUrl = new URLSearchParams(window.location.search).get("isbn");
if (isbnUrl) selectLibro.value = isbnUrl;

// Autocompleta el autor
function actualizarAutor() {
    const l = libros.find((x) => x.isbn === selectLibro.value);
    inputAutor.value = l ? l.autor : "";
}
selectLibro.addEventListener("change", actualizarAutor);
actualizarAutor();

// Guarda la reseña
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nueva = {
        isbn:      selectLibro.value,
        texto:     document.getElementById("resena").value.trim(),
        nombre:    document.getElementById("nombre").value.trim() || "Anónimo",
        estrellas: Number(form.calificacion.value),
        fecha:     new Date().toLocaleDateString("es-UY")
    };

    const guardadas = JSON.parse(localStorage.getItem("reviews") || "[]");
    guardadas.push(nueva);
    localStorage.setItem("reviews", JSON.stringify(guardadas));

    form.reset();
    actualizarAutor();
    mensajeForm.textContent = "¡Gracias! Tu reseña fue guardada.";
    mensajeForm.className = "mensaje-form exito";
});