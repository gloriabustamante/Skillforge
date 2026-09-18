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


// BOTÓN SALIR
const logout = document.getElementById("logout");

logout.addEventListener("click", function () {
    alert("Sesión cerrada");
});


// TARJETAS CLICKEABLES
cards.forEach(function (card) {

    card.addEventListener("click", function () {

        const titulo = card.querySelector("h3").textContent;

        console.log("Seleccionaste: " + titulo);

    });

});