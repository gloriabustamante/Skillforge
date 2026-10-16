// Datos de nuestra API (al momento son datos ilustrativos)

const libros = [
    { isbn: "978-84-9838-037-9", titulo: "Harry Potter y la piedra filosofal", categoria: "Ficción",
      descripcion: "Harry descubre que es un mago y viaja a Hogwarts.", imagen: "img/harry-potter.jpg" },
    { isbn: "978-0-00-000001-1", titulo: "Libro de ficción 2", categoria: "Ficción",
      descripcion: "Descripción breve del libro.", imagen: "" },
    { isbn: "978-0-00-000002-2", titulo: "Libro de no ficción 1", categoria: "No ficción",
      descripcion: "Descripción breve del libro.", imagen: "" },
    { isbn: "978-0-00-000003-3", titulo: "Libro de no ficción 2", categoria: "No ficción",
      descripcion: "Descripción breve del libro.", imagen: "" },
    { isbn: "978-0-00-000004-4", titulo: "Libro infantil", categoria: "Infantil",
      descripcion: "Descripción breve del libro.", imagen: "" },
    { isbn: "978-0-00-000005-5", titulo: "Libro de ensayo", categoria: "Ensayo",
      descripcion: "Descripción breve del libro.", imagen: "" }
];

const categorias = ["Todos", "Ficción", "No ficción", "Infantil", "Ensayo"];

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
                            l.descripcion.toLowerCase().includes(texto);
        return coincideCategoria && coincideTexto;
    });

    if (filtrados.length === 0) {
        listaLibros.innerHTML = `<p class="sin-resultados">No se encontraron libros.</p>`;
        return;
    }

    listaLibros.innerHTML = filtrados.map((l) => `
        <a class="libro-card" href="detalle-libro.html?isbn=${l.isbn}">
            <div class="libro-imagen">
                ${l.imagen
                    ? `<img src="${l.imagen}" alt="${l.titulo}" onerror="this.remove()">`
                    : `<i class="fa-regular fa-image"></i>`}
            </div>
            <h3>${l.titulo}</h3>
            <p>${l.descripcion}</p>
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