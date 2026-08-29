const formularioBusqueda = document.querySelector(".buscador");
const campoBusqueda = document.querySelector("#buscar");
const mensajeBusqueda = document.querySelector("#resultado-busqueda");
const sugerenciasBusqueda = document.querySelectorAll(
  ".buscador__sugerencias [data-busqueda]"
);
const elementosBuscables = document.querySelectorAll(
  ".producto-destacado, .sector-productos, .tarjeta-categoria, .tarjeta-servicio"
);

const normalizarTexto = (texto) =>
  texto
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const filtrarCatalogo = (termino, desplazar = false) => {
  const consulta = normalizarTexto(termino);
  let coincidencias = 0;
  let primerResultado = null;

  elementosBuscables.forEach((elemento) => {
    const contenido = normalizarTexto(
      `${elemento.dataset.busqueda || ""} ${elemento.textContent}`
    );

    const coincide = consulta === "" || contenido.includes(consulta);

    elemento.classList.toggle(
      "elemento-busqueda-oculto",
      !coincide
    );

    if (coincide && consulta !== "") {
      coincidencias += 1;
      primerResultado ||= elemento;
    }
  });

  if (consulta === "") {
    mensajeBusqueda.textContent = "";
    return;
  }

  mensajeBusqueda.textContent = coincidencias
    ? `${coincidencias} resultado${coincidencias === 1 ? "" : "s"} encontrado${coincidencias === 1 ? "" : "s"}.`
    : "No encontramos coincidencias. Escríbenos por WhatsApp y te ayudamos.";

  if (desplazar && primerResultado) {
    primerResultado.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
};

campoBusqueda?.addEventListener("input", (evento) => {
  filtrarCatalogo(evento.target.value);
});

formularioBusqueda?.addEventListener("submit", (evento) => {
  evento.preventDefault();
  filtrarCatalogo(campoBusqueda.value, true);
});

sugerenciasBusqueda.forEach((boton) => {
  boton.addEventListener("click", () => {
    campoBusqueda.value = boton.dataset.busqueda;
    filtrarCatalogo(campoBusqueda.value, true);
  });
});