const formularioBusqueda = document.querySelector(".buscador");
const campoBusqueda = document.querySelector("#buscar");
const mensajeBusqueda = document.querySelector("#resultado-busqueda");

const sugerenciasBusqueda = document.querySelectorAll(
  ".buscador__sugerencias [data-busqueda]"
);

const elementosBuscables = document.querySelectorAll(
  ".producto-destacado, .sector-productos, .tarjeta-categoria, .tarjeta-servicio"
);

/* =====================================
   BUSCADOR
===================================== */

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

    const coincide =
      consulta === "" || contenido.includes(consulta);

    elemento.classList.toggle(
      "elemento-busqueda-oculto",
      !coincide
    );

    if (coincide && consulta !== "") {
      coincidencias += 1;

      if (!primerResultado) {
        primerResultado = elemento;
      }
    }
  });

  if (!mensajeBusqueda) return;

  if (consulta === "") {
    mensajeBusqueda.textContent = "";
    return;
  }

  mensajeBusqueda.textContent = coincidencias
    ? `${coincidencias} resultado${
        coincidencias === 1 ? "" : "s"
      } encontrado${coincidencias === 1 ? "" : "s"}.`
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

  if (!campoBusqueda) return;

  filtrarCatalogo(campoBusqueda.value, true);
});

sugerenciasBusqueda.forEach((boton) => {
  boton.addEventListener("click", () => {
    if (!campoBusqueda) return;

    campoBusqueda.value = boton.dataset.busqueda;
    filtrarCatalogo(campoBusqueda.value, true);
  });
});

/* =====================================
   MENÚ PRINCIPAL PARA CELULARES
===================================== */

const botonMenuPrincipal =
  document.querySelector(".boton-menu");

const menuPrincipal =
  document.querySelector("#menu-principal");

const cerrarMenuPrincipal = () => {
  menuPrincipal?.classList.remove(
    "menu-principal-abierto"
  );

  botonMenuPrincipal?.setAttribute(
    "aria-expanded",
    "false"
  );

  const icono = botonMenuPrincipal?.querySelector(
    '[aria-hidden="true"]'
  );

  if (icono) {
    icono.textContent = "☰";
  }
};

botonMenuPrincipal?.addEventListener(
  "click",
  (evento) => {
    evento.stopPropagation();

    const seAbrira =
      !menuPrincipal?.classList.contains(
        "menu-principal-abierto"
      );

    menuPrincipal?.classList.toggle(
      "menu-principal-abierto",
      seAbrira
    );

    botonMenuPrincipal.setAttribute(
      "aria-expanded",
      String(seAbrira)
    );

    const icono = botonMenuPrincipal.querySelector(
      '[aria-hidden="true"]'
    );

    if (icono) {
      icono.textContent = seAbrira ? "×" : "☰";
    }
  }
);

// Cerrar cuando se selecciona una opción
menuPrincipal
  ?.querySelectorAll("a")
  .forEach((enlace) => {
    enlace.addEventListener(
      "click",
      cerrarMenuPrincipal
    );
  });

/* =====================================
   SUBMENÚS DE PRODUCTOS Y LOCALES
===================================== */

const menusDesplegables =
  document.querySelectorAll(".menu-desplegable");

const cerrarMenus = (excepto = null) => {
  menusDesplegables.forEach((menu) => {
    if (menu === excepto) return;

    menu.classList.remove("menu-abierto");

    const boton = menu.querySelector(
      ".menu-desplegable__boton"
    );

    boton?.setAttribute(
      "aria-expanded",
      "false"
    );
  });
};

menusDesplegables.forEach((menu) => {
  const boton = menu.querySelector(
    ".menu-desplegable__boton"
  );

  boton?.addEventListener("click", (evento) => {
    evento.stopPropagation();

    const seAbrira =
      !menu.classList.contains("menu-abierto");

    cerrarMenus(menu);

    menu.classList.toggle(
      "menu-abierto",
      seAbrira
    );

    boton.setAttribute(
      "aria-expanded",
      String(seAbrira)
    );
  });

  const enlaces = menu.querySelectorAll(
    ".menu-desplegable__panel a"
  );

  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", () => {
      cerrarMenus();
    });
  });
});

/* =====================================
   CERRAR MENÚS
===================================== */

// Cerrar al tocar fuera
document.addEventListener("click", () => {
  cerrarMenus();
  cerrarMenuPrincipal();
});

// Cerrar con la tecla Escape
document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") {
    cerrarMenus();
    cerrarMenuPrincipal();
  }
});

/* =====================================
   CARRUSEL DE PRODUCTOS
===================================== */

const carruselProductos =
  document.querySelector("#vitrina-productos");

const controlesCarrusel =
  document.querySelectorAll("[data-carrusel]");

const imagenesProductos = document.querySelectorAll(
  ".producto-destacado__imagen img"
);

imagenesProductos.forEach((imagen) => {
  const contenedorImagen = imagen.closest(
    ".producto-destacado__imagen"
  );

  const mostrarImagen = () => {
    contenedorImagen?.classList.add(
      "imagen-disponible"
    );
  };

  const mostrarReferencia = () => {
    contenedorImagen?.classList.remove(
      "imagen-disponible"
    );
  };

  imagen.addEventListener(
    "load",
    mostrarImagen
  );

  imagen.addEventListener(
    "error",
    mostrarReferencia
  );

  if (imagen.complete) {
    if (imagen.naturalWidth > 0) {
      mostrarImagen();
    } else {
      mostrarReferencia();
    }
  }
});

controlesCarrusel.forEach((control) => {
  control.addEventListener("click", () => {
    if (!carruselProductos) return;

    const direccion =
      control.dataset.carrusel === "siguiente"
        ? 1
        : -1;

    const distancia = Math.max(
      260,
      carruselProductos.clientWidth * 0.82
    );

    carruselProductos.scrollBy({
      left: distancia * direccion,
      behavior: "smooth"
    });
  });
});