// BOTÓN SALIR
const btnSalir = document.getElementById("btnSalir");

btnSalir.addEventListener("click", function () {
    window.location.href = "login.html";
});

// BUSCADOR
const search = document.getElementById("search");
const cards = document.querySelectorAll(".card");

search.addEventListener("input", function () {

    const texto = search.value.toLowerCase();

    cards.forEach(function (card) {

        const contenido = card.textContent.toLowerCase();

        if (contenido.includes(texto)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }

    });

});

// TARJETAS CLICKEABLES

cards.forEach(function (card) {

    card.addEventListener("click", function () {

        const titulo = card.querySelector("h3").textContent;

        console.log("Seleccionaste: " + titulo);

    });

});