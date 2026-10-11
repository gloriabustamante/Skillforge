const libros = obtenerLibros();

const categorias = ["Todos", ...new Set(libros.map((l) => l.categoria))];

//Estado

let categoriaActiva = "Todos";
let textoBusqueda = "";

const listaCategorias = document.getElementById("listaCategorias");
const listaLibros = document.getElementById("listaLibros");
const buscador = document.getElementById("buscador");


// CATEGORÍAS

function contar(categoria) {
    if (categoria === "Todos") return libros.length;
    return libros.filter((l) => l.categoria === categoria).length;
}

function mostrarCategorias() {
    listaCategorias.innerHTML = categorias.map((c) => `
        <li data-categoria="${c}" class="${c === categoriaActiva ? "activa" : ""}">
            ${c} <span>${contar(c)}</span>
        </li>
    `).join("");
}

listaCategorias.addEventListener("click", (e) => {
    const item = e.target.closest("li");
    if (!item) return;

    categoriaActiva = item.dataset.categoria;
    mostrarCategorias();
    mostrarLibros();
});

// Funcion para mostrar los libros

function mostrarLibros() {
    const texto = textoBusqueda.toLowerCase();

    const filtrados = libros.filter((l) => {
        const coincideCategoria = categoriaActiva === "Todos" || l.categoria === categoriaActiva;
        const coincideTexto = l.titulo.toLowerCase().includes(texto) ||
                    l.autor.toLowerCase().includes(texto) ||
                    (l.descripcion || "").toLowerCase().includes(texto);
        return coincideCategoria && coincideTexto;
    });

    if (filtrados.length === 0) {
        listaLibros.innerHTML = `<p class="sin-resultados">No se encontraron libros.</p>`;
        return;
    }

    listaLibros.innerHTML = filtrados.map((l) => `
        <a class="libro-card" href="detalle-libro.html?isbn=${encodeURIComponent(l.isbn)}">
            <div class="libro-imagen">
                ${l.portada
                    ? `<img src="${l.portada}" alt="${l.titulo}" onerror="this.remove()">`
                    : `<i class="fa-regular fa-image"></i>`}
            </div>
            <h3>${l.titulo}</h3>
            <p>${l.descripcion || l.autor}</p>
        </a>
    `).join("");
}


// BÚSQUEDA

buscador.addEventListener("input", () => {
    textoBusqueda = buscador.value.trim();
    mostrarLibros();
});


//Función de cierre de sesión

document.getElementById("btnSalir").addEventListener("click", () => {
    window.location.href = "login.html";
});


mostrarCategorias();
mostrarLibros();