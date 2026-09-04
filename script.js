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

document.addEventListener("click", () => {
  cerrarMenus();
  cerrarMenuPrincipal();
});

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

/* =====================================
   CARRUSEL INFINITO DE CATEGORÍAS
===================================== */

const carruselCategorias = document.querySelector(
  "[data-carrusel-categorias]"
);

if (carruselCategorias) {
  const pistaCategorias = carruselCategorias.querySelector(
    ".carrusel-categorias__pista"
  );

  const diapositivasCategorias = Array.from(
    carruselCategorias.querySelectorAll(
      "[data-categoria-slide]"
    )
  );

  const puntosCategorias = Array.from(
    carruselCategorias.querySelectorAll(
      "[data-categoria-punto]"
    )
  );

  const botonAnteriorCategoria =
    carruselCategorias.querySelector(
      "[data-categoria-anterior]"
    );

  const botonSiguienteCategoria =
    carruselCategorias.querySelector(
      "[data-categoria-siguiente]"
    );

  let categoriaActual = 0;
  let posicionVisual = 1;
  let temporizadorCategorias = null;
  let inicioDeslizamiento = 0;
  let carruselEnMovimiento = false;

  const movimientoReducido = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  /*
   * Crea una copia del último elemento al principio
   * y una copia del primero al final.
   * Esto permite que el movimiento sea infinito.
   */
  if (
    pistaCategorias &&
    diapositivasCategorias.length > 1
  ) {
    const primeraCopia =
      diapositivasCategorias[0].cloneNode(true);

    const ultimaCopia =
      diapositivasCategorias[
        diapositivasCategorias.length - 1
      ].cloneNode(true);

    [primeraCopia, ultimaCopia].forEach((copia) => {
      copia.removeAttribute("id");
      copia.removeAttribute("data-categoria-slide");
      copia.setAttribute("aria-hidden", "true");
    });

    pistaCategorias.prepend(ultimaCopia);
    pistaCategorias.append(primeraCopia);
  }

  const actualizarEstadoCategoria = () => {
    if (!diapositivasCategorias.length) return;

    diapositivasCategorias.forEach(
      (diapositiva, posicion) => {
        diapositiva.setAttribute(
          "aria-hidden",
          posicion === categoriaActual
            ? "false"
            : "true"
        );
      }
    );

    puntosCategorias.forEach((punto, posicion) => {
      const estaActivo =
        posicion === categoriaActual;

      punto.classList.toggle(
        "esta-activo",
        estaActivo
      );

      if (estaActivo) {
        punto.setAttribute("aria-current", "true");
      } else {
        punto.removeAttribute("aria-current");
      }
    });
  };

  const moverPistaCategorias = (animar = true) => {
    if (!pistaCategorias) return;

    const puedeAnimar =
      animar && !movimientoReducido.matches;

    pistaCategorias.style.transition = puedeAnimar
      ? ""
      : "none";

    pistaCategorias.style.transform =
      `translateX(-${posicionVisual * 100}%)`;

    carruselEnMovimiento = puedeAnimar;
  };

  /*
   * Después de mostrar una diapositiva copiada,
   * coloca silenciosamente el carrusel sobre
   * la diapositiva original correspondiente.
   */
  const normalizarExtremos = () => {
    if (!pistaCategorias) return;

    if (posicionVisual === 0) {
      posicionVisual = diapositivasCategorias.length;
    } else if (
      posicionVisual === diapositivasCategorias.length + 1
    ) {
      posicionVisual = 1;
    } else {
      carruselEnMovimiento = false;
      return;
    }

    pistaCategorias.style.transition = "none";

    pistaCategorias.style.transform =
      `translateX(-${posicionVisual * 100}%)`;

    pistaCategorias.getBoundingClientRect();
    pistaCategorias.style.transition = "";
    carruselEnMovimiento = false;
  };

  const mostrarCategoria = (indice, animar = true) => {
    if (
      !diapositivasCategorias.length ||
      carruselEnMovimiento
    ) {
      return;
    }

    categoriaActual =
      (indice + diapositivasCategorias.length) %
      diapositivasCategorias.length;

    posicionVisual = categoriaActual + 1;

    actualizarEstadoCategoria();
    moverPistaCategorias(animar);
  };

  const detenerCarruselCategorias = () => {
    if (temporizadorCategorias) {
      window.clearInterval(temporizadorCategorias);
      temporizadorCategorias = null;
    }
  };

  const iniciarCarruselCategorias = () => {
    detenerCarruselCategorias();

    if (
      movimientoReducido.matches ||
      document.hidden ||
      diapositivasCategorias.length < 2
    ) {
      return;
    }

    temporizadorCategorias = window.setInterval(
      () => {
        cambiarCategoria(1);
      },
      5000
    );
  };

  const cambiarCategoria = (direccion) => {
    if (
      !diapositivasCategorias.length ||
      carruselEnMovimiento
    ) {
      return;
    }

    categoriaActual =
      (
        categoriaActual +
        direccion +
        diapositivasCategorias.length
      ) % diapositivasCategorias.length;

    posicionVisual += direccion;

    actualizarEstadoCategoria();
    moverPistaCategorias(true);

    if (movimientoReducido.matches) {
      normalizarExtremos();
    }

    iniciarCarruselCategorias();
  };

  pistaCategorias?.addEventListener(
    "transitionend",
    (evento) => {
      if (evento.propertyName === "transform") {
        normalizarExtremos();
      }
    }
  );

  botonAnteriorCategoria?.addEventListener(
    "click",
    () => cambiarCategoria(-1)
  );

  botonSiguienteCategoria?.addEventListener(
    "click",
    () => cambiarCategoria(1)
  );

  puntosCategorias.forEach((punto) => {
    punto.addEventListener("click", () => {
      mostrarCategoria(
        Number(punto.dataset.categoriaPunto)
      );

      iniciarCarruselCategorias();
    });
  });

  carruselCategorias.addEventListener(
    "mouseenter",
    detenerCarruselCategorias
  );

  carruselCategorias.addEventListener(
    "mouseleave",
    iniciarCarruselCategorias
  );

  carruselCategorias.addEventListener(
    "focusin",
    detenerCarruselCategorias
  );

  carruselCategorias.addEventListener(
    "focusout",
    (evento) => {
      if (
        !carruselCategorias.contains(
          evento.relatedTarget
        )
      ) {
        iniciarCarruselCategorias();
      }
    }
  );

  carruselCategorias.addEventListener(
    "keydown",
    (evento) => {
      if (evento.key === "ArrowLeft") {
        evento.preventDefault();
        cambiarCategoria(-1);
      }

      if (evento.key === "ArrowRight") {
        evento.preventDefault();
        cambiarCategoria(1);
      }
    }
  );

  carruselCategorias.addEventListener(
    "pointerdown",
    (evento) => {
      if (evento.pointerType === "touch") {
        inicioDeslizamiento = evento.clientX;
        detenerCarruselCategorias();
      }
    }
  );

  carruselCategorias.addEventListener(
    "pointerup",
    (evento) => {
      if (evento.pointerType !== "touch") return;

      const distancia =
        evento.clientX - inicioDeslizamiento;

      if (Math.abs(distancia) > 45) {
        cambiarCategoria(
          distancia > 0 ? -1 : 1
        );
      } else {
        iniciarCarruselCategorias();
      }
    }
  );

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        detenerCarruselCategorias();
      } else {
        iniciarCarruselCategorias();
      }
    }
  );

  movimientoReducido.addEventListener?.(
    "change",
    iniciarCarruselCategorias
  );

  mostrarCategoria(0, false);
  pistaCategorias?.getBoundingClientRect();

  if (pistaCategorias) {
    pistaCategorias.style.transition = "";
  }

  iniciarCarruselCategorias();
}