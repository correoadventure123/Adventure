/* Adventure: menú, catálogo, imágenes y carruseles compartidos. */
(() => {
  if (window.adventureReady) return;
  window.adventureReady = true;

  const init = () => {
    const reduced = matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const mobile = matchMedia(
      "(max-width: 760px)"
    );

    /* ==============================
       MENÚ PRINCIPAL
    ============================== */

    const menu =
      document.querySelector("#menu-principal");

    const toggle =
      document.querySelector(".boton-menu");

    const dropdowns = [
      ...document.querySelectorAll(
        ".menu-desplegable"
      )
    ];

    const closeDropdowns = (except) => {
      dropdowns.forEach((item) => {
        if (item === except) return;

        item.classList.remove("menu-abierto");

        item
          .querySelector("button")
          ?.setAttribute(
            "aria-expanded",
            "false"
          );
      });
    };

    const setMenu = (open) => {
      menu?.classList.toggle(
        "menu-principal-abierto",
        open
      );

      toggle?.setAttribute(
        "aria-expanded",
        String(open)
      );

      const icon =
        toggle?.querySelector("[aria-hidden]");

      const label =
        toggle?.querySelector(".sr-only");

      if (icon) {
        icon.textContent = open ? "×" : "☰";
      }

      if (label) {
        label.textContent = open
          ? "Cerrar menú"
          : "Abrir menú";
      }

      if (!open) {
        closeDropdowns();
      }
    };

    toggle?.addEventListener("click", () => {
      setMenu(
        toggle.getAttribute("aria-expanded") !==
          "true"
      );
    });

    dropdowns.forEach((item) => {
      const button = item.querySelector(
        ".menu-desplegable__boton"
      );

      button?.addEventListener("click", () => {
        const open =
          !item.classList.contains(
            "menu-abierto"
          );

        closeDropdowns(item);

        item.classList.toggle(
          "menu-abierto",
          open
        );

        button.setAttribute(
          "aria-expanded",
          String(open)
        );
      });
    });

    menu?.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        setMenu(false);
      }
    });

    document.addEventListener(
      "click",
      (event) => {
        if (
          !menu?.contains(event.target) &&
          !toggle?.contains(event.target)
        ) {
          setMenu(false);
        }
      }
    );

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Escape") return;

        const open =
          toggle?.getAttribute(
            "aria-expanded"
          ) === "true";

        const active =
          document.activeElement?.closest(
            ".menu-desplegable"
          );

        setMenu(false);

        if (open && mobile.matches) {
          toggle.focus();
        } else {
          active
            ?.querySelector("button")
            ?.focus();
        }
      }
    );

    mobile.addEventListener(
      "change",
      () => setMenu(false)
    );

    /* ==============================
       IMÁGENES Y MARCADORES
    ============================== */

    document
      .querySelectorAll(
        ".ad-media img, .producto-destacado__imagen img"
      )
      .forEach((img) => {
        const box = img.parentElement;

        const paint = () => {
          const loaded =
            img.complete &&
            img.naturalWidth > 0;

          box.classList.toggle(
            "has-image",
            loaded
          );

          box.classList.toggle(
            "imagen-disponible",
            loaded
          );
        };

        const fallback = () => {
          if (img.dataset.respaldo) {
            const src =
              img.dataset.respaldo;

            delete img.dataset.respaldo;
            img.src = src;
          } else {
            paint();
          }
        };

        img.addEventListener(
          "load",
          paint
        );

        img.addEventListener(
          "error",
          fallback
        );

        if (img.complete) {
          img.naturalWidth
            ? paint()
            : fallback();
        }
      });

    /* ==============================
       ANIMACIONES AL BAJAR
    ============================== */

    const animations = new Set();

    const appear = (
      element,
      delay = 0
    ) => {
      if (
        reduced.matches ||
        !element.animate
      ) {
        return;
      }

      const animation =
        element.animate(
          [
            {
              opacity: 0,
              transform:
                "translateY(12px)"
            },
            {
              opacity: 1,
              transform:
                "translateY(0)"
            }
          ],
          {
            duration: 420,
            delay,
            easing:
              "cubic-bezier(.2,.8,.2,1)"
          }
        );

      animations.add(animation);

      animation.onfinish =
        animation.oncancel = () => {
          animations.delete(animation);
        };
    };

    reduced.addEventListener(
      "change",
      () => {
        if (reduced.matches) {
          [...animations].forEach(
            (animation) =>
              animation.cancel()
          );
        }
      }
    );

    if (
      "IntersectionObserver" in window
    ) {
      const reveal =
        new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              appear(entry.target);
              reveal.unobserve(
                entry.target
              );
            });
          },
          {
            threshold: 0.05
          }
        );

      document
        .querySelectorAll(
          "[data-reveal]"
        )
        .forEach((element) => {
          reveal.observe(element);
        });
    }

    /* ==============================
       FILTROS DE PRODUCTOS
    ============================== */

    document
      .querySelectorAll(
        "[data-catalog]"
      )
      .forEach((catalog) => {
        const controls =
          catalog.querySelector(
            ".ad-filters"
          );

        const track =
          catalog.querySelector(
            ".ad-products"
          );

        const cards = [
          ...catalog.querySelectorAll(
            "[data-category]"
          )
        ];

        const status =
          catalog.querySelector(
            "[data-filter-status]"
          );

        if (!controls || !track) {
          return;
        }

        controls.hidden = false;

        controls.addEventListener(
          "click",
          (event) => {
            const button =
              event.target.closest(
                "[data-filter]"
              );

            if (
              !button ||
              button.getAttribute(
                "aria-pressed"
              ) === "true"
            ) {
              return;
            }

            controls
              .querySelectorAll("button")
              .forEach((item) => {
                item.setAttribute(
                  "aria-pressed",
                  String(item === button)
                );
              });

            let visible = 0;

            cards.forEach((card) => {
              card
                .getAnimations?.()
                .forEach((animation) => {
                  animation.cancel();
                });

              card.hidden =
                button.dataset.filter !==
                  "todos" &&
                card.dataset.category !==
                  button.dataset.filter;

              if (!card.hidden) {
                appear(
                  card,
                  Math.min(
                    visible++ * 35,
                    140
                  )
                );
              }
            });

            track.scrollLeft = 0;

            if (status) {
              status.textContent =
                `${button.textContent}: ` +
                `${visible} fichas en el catálogo.`;
            }
          }
        );
      });

    /* ==============================
       CONTROLES DEL CATÁLOGO
    ============================== */

    document
      .querySelectorAll(
        "[data-carrusel]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            const track =
              document.querySelector(
                ".fila-productos"
              ) ||
              document.querySelector(
                "#vitrina-productos"
              );

            track?.scrollBy({
              left:
                track.clientWidth *
                0.85 *
                (
                  button.dataset
                    .carrusel ===
                  "siguiente"
                    ? 1
                    : -1
                ),

              behavior:
                reduced.matches
                  ? "instant"
                  : "smooth"
            });
          }
        );
      });
/* ==============================
   FILAS DE PRODUCTOS DESLIZABLES
============================== */

document
  .querySelectorAll(".fila-productos")
  .forEach((track) => {
    let frame = 0;

    const updateEdges = () => {
      const maximum = Math.max(
        0,
        track.scrollWidth -
          track.clientWidth
      );

      const position = Math.max(
        0,
        track.scrollLeft
      );

      track.classList.toggle(
        "tiene-desborde-izquierda",
        position > 4
      );

      track.classList.toggle(
        "tiene-desborde-derecha",
        position < maximum - 4
      );
    };

    const requestEdgeUpdate = () => {
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(
        updateEdges
      );
    };

    track.addEventListener(
      "scroll",
      requestEdgeUpdate,
      {
        passive: true
      }
    );

    if (
      "ResizeObserver" in window
    ) {
      new ResizeObserver(
        requestEdgeUpdate
      ).observe(track);
    } else {
      window.addEventListener(
        "resize",
        requestEdgeUpdate
      );
    }

    track
      .querySelectorAll(
        ".producto-destacado"
      )
      .forEach((card, index) => {
        if (
          reduced.matches ||
          !card.animate
        ) {
          return;
        }

        card.animate(
          [
            {
              opacity: 0,
              transform:
                "translateX(14px)"
            },
            {
              opacity: 1,
              transform:
                "translateX(0)"
            }
          ],
          {
            duration: 380,
            delay: Math.min(
              index * 35,
              210
            ),
            easing:
              "cubic-bezier(.2,.8,.2,1)",
            fill: "both"
          }
        );
      });

    requestEdgeUpdate();
  });
    /* ==============================
       CARRUSEL PRINCIPAL AUTOMÁTICO
    ============================== */

    document
      .querySelectorAll(
        "[data-carrusel-categorias]"
      )
      .forEach((root) => {
        const track =
          root.querySelector(
            ".carrusel-categorias__pista"
          );

        const slides = [
          ...root.querySelectorAll(
            "[data-categoria-slide]"
          )
        ];

        if (
          !track ||
          slides.length < 2
        ) {
          return;
        }

        const clone = (slide) => {
          const copy =
            slide.cloneNode(true);

          copy.removeAttribute("id");

          copy.removeAttribute(
            "data-categoria-slide"
          );

          copy
            .querySelectorAll("[id]")
            .forEach((node) => {
              node.removeAttribute("id");
            });

          copy.setAttribute(
            "aria-hidden",
            "true"
          );

          copy.inert = true;

          return copy;
        };

        track.prepend(
          clone(
            slides[
              slides.length - 1
            ]
          )
        );

        track.append(
          clone(slides[0])
        );

        let index = 0;
        let position = 1;
        let busy = false;
        let timer;
        let recovery;

        let visible = true;
        let hover = false;
        let pressed = false;
        let paused = false;
        let startX = 0;

        const pause =
          document.createElement(
            "button"
          );

        pause.type = "button";

        pause.className =
          "ad-banner-pause";

        pause.textContent = "Pausar";

        pause.setAttribute(
          "aria-pressed",
          "false"
        );

        root.append(pause);

        const allowed = () =>
          !reduced.matches &&
          !document.hidden &&
          visible &&
          !hover &&
          !pressed &&
          !paused &&
          !root.contains(
            document.activeElement
          );

        const schedule = () => {
          clearTimeout(timer);

          if (allowed()) {
            timer = setTimeout(
              () => move(1),
              5000
            );
          }
        };

        const paint = (animate) => {
          track.style.transition =
            animate &&
            !reduced.matches
              ? ""
              : "none";

          track.style.transform =
            `translateX(-${
              position * 100
            }%)`;

          slides.forEach(
            (slide, i) => {
              slide.setAttribute(
                "aria-hidden",
                String(i !== index)
              );

              slide.inert =
                i !== index;
            }
          );

          root
            .querySelectorAll(
              "[data-categoria-punto]"
            )
            .forEach(
              (point, i) => {
                point.classList.toggle(
                  "esta-activo",
                  i === index
                );

                if (i === index) {
                  point.setAttribute(
                    "aria-current",
                    "true"
                  );
                } else {
                  point.removeAttribute(
                    "aria-current"
                  );
                }
              }
            );
        };

        const finish = () => {
          clearTimeout(recovery);

          if (position === 0) {
            position =
              slides.length;
          }

          if (
            position ===
            slides.length + 1
          ) {
            position = 1;
          }

          paint(false);
          busy = false;
        };

        const showHashSlide = () => {
          let hash = "";

          try {
            hash = decodeURIComponent(
              window.location.hash.slice(1)
            );
          } catch {
            return;
          }

          if (!hash) return;

          const hashIndex = slides.findIndex(
            (slide) => slide.id === hash
          );

          if (hashIndex < 0) return;

          if (busy) finish();

          index = hashIndex;
          position = hashIndex + 1;
          paint(false);
          schedule();
        };

        function move(direction) {
          if (busy) return;

          busy = true;

          index =
            (
              index +
              direction +
              slides.length
            ) % slides.length;

          position += direction;

          track.getBoundingClientRect();
          paint(true);

          if (reduced.matches) {
            finish();
          } else {
            recovery = setTimeout(
              finish,
              800
            );
          }

          schedule();
        }

        track.addEventListener(
          "transitionend",
          (event) => {
            if (
              event.target === track &&
              event.propertyName ===
                "transform"
            ) {
              finish();
            }
          }
        );

        root
          .querySelector(
            "[data-categoria-anterior]"
          )
          ?.addEventListener(
            "click",
            () => move(-1)
          );

        root
          .querySelector(
            "[data-categoria-siguiente]"
          )
          ?.addEventListener(
            "click",
            () => move(1)
          );

        root
          .querySelectorAll(
            "[data-categoria-punto]"
          )
          .forEach((point, i) => {
            point.addEventListener(
              "click",
              () => {
                if (busy) finish();

                index = i;
                position = i + 1;

                paint(true);
                schedule();
              }
            );
          });

        pause.addEventListener(
          "click",
          () => {
            paused = !paused;

            pause.textContent =
              paused
                ? "Reanudar"
                : "Pausar";

            pause.setAttribute(
              "aria-pressed",
              String(paused)
            );

            schedule();
          }
        );

        root.addEventListener(
          "pointerenter",
          (event) => {
            if (
              event.pointerType ===
              "mouse"
            ) {
              hover = true;
              schedule();
            }
          }
        );

        root.addEventListener(
          "pointerleave",
          () => {
            hover = false;
            schedule();
          }
        );

        root.addEventListener(
          "focusin",
          schedule
        );

        root.addEventListener(
          "focusout",
          () => {
            setTimeout(schedule, 0);
          }
        );

        root.addEventListener(
          "pointerdown",
          (event) => {
            if (
              event.pointerType ===
              "touch"
            ) {
              pressed = true;
              startX = event.clientX;
              schedule();
            }
          }
        );

        root.addEventListener(
          "pointerup",
          (event) => {
            if (!pressed) return;

            pressed = false;

            if (
              Math.abs(
                event.clientX -
                  startX
              ) > 45
            ) {
              move(
                event.clientX >
                  startX
                  ? -1
                  : 1
              );
            }

            schedule();
          }
        );

        root.addEventListener(
          "pointercancel",
          () => {
            pressed = false;
            schedule();
          }
        );

        root.addEventListener(
          "keydown",
          (event) => {
            if (
              event.key ===
                "ArrowLeft" ||
              event.key ===
                "ArrowRight"
            ) {
              event.preventDefault();

              move(
                event.key ===
                  "ArrowRight"
                  ? 1
                  : -1
              );
            }
          }
        );

        if (
          "IntersectionObserver" in
          window
        ) {
          new IntersectionObserver(
            ([entry]) => {
              visible =
                entry.isIntersecting;

              schedule();
            },
            {
              threshold: 0.15
            }
          ).observe(root);
        }

        document.addEventListener(
          "visibilitychange",
          schedule
        );

        reduced.addEventListener(
          "change",
          () => {
            finish();
            schedule();
          }
        );

        paint(false);
        showHashSlide();
        window.addEventListener(
          "hashchange",
          showHashSlide
        );
        schedule();
      });

    /* ==============================
       PASOS DE COMPRA AUTOMÁTICOS
    ============================== */

    document
      .querySelectorAll(
        ".pasos, [data-steps]"
      )
      .forEach((track) => {
        const cards = [
          ...track.children
        ].filter(
          (node) =>
            node.tagName === "LI"
        );

        if (cards.length < 2) {
          return;
        }

        const wrapper =
          track.closest(
            "[data-step-carousel]"
          ) || track.parentElement;

        const controls =
          wrapper.querySelector(
            ".ad-step-controls"
          );

        const status =
          controls?.querySelector(
            "[data-step-status]"
          );

        const pause =
          controls?.querySelector(
            "[data-step-pause]"
          );

        if (controls) {
          controls.hidden = false;
        }

        let current = 0;
        let timer;
        let visible = true;
        let pressed = false;
        let hover = false;
        let paused = false;

        const destination = (i) =>
          cards[i].offsetLeft -
          cards[0].offsetLeft;

        const nearest = () => {
          current = cards.reduce(
            (best, card, i) =>
              Math.abs(
                destination(i) -
                  track.scrollLeft
              ) <
              Math.abs(
                destination(best) -
                  track.scrollLeft
              )
                ? i
                : best,
            0
          );

          if (status) {
            status.textContent =
              `${current + 1} / ` +
              `${cards.length}`;
          }
        };

        const schedule = () => {
          clearTimeout(timer);

          if (
            mobile.matches &&
            visible &&
            !reduced.matches &&
            !document.hidden &&
            !pressed &&
            !hover &&
            !paused &&
            !wrapper.contains(
              document.activeElement
            )
          ) {
            timer = setTimeout(
              () => go(1),
              5000
            );
          }
        };

        const go = (direction) => {
          if (!mobile.matches) {
            return;
          }

          nearest();

          current =
            (
              current +
              direction +
              cards.length
            ) % cards.length;

          track.scrollTo({
            left:
              destination(current),

            behavior:
              reduced.matches
                ? "instant"
                : "smooth"
          });

          schedule();
        };

        controls
          ?.querySelector(
            "[data-step-prev]"
          )
          ?.addEventListener(
            "click",
            () => go(-1)
          );

        controls
          ?.querySelector(
            "[data-step-next]"
          )
          ?.addEventListener(
            "click",
            () => go(1)
          );

        pause?.addEventListener(
          "click",
          () => {
            paused = !paused;

            pause.textContent =
              paused
                ? "Reanudar"
                : "Pausar";

            pause.setAttribute(
              "aria-pressed",
              String(paused)
            );

            schedule();
          }
        );

        track.addEventListener(
          "scroll",
          () => {
            nearest();
            schedule();
          },
          {
            passive: true
          }
        );

        track.addEventListener(
          "pointerdown",
          () => {
            pressed = true;
            schedule();
          }
        );

        window.addEventListener(
          "pointerup",
          () => {
            if (pressed) {
              pressed = false;
              schedule();
            }
          }
        );

        track.addEventListener(
          "pointercancel",
          () => {
            pressed = false;
            schedule();
          }
        );

        wrapper.addEventListener(
          "pointerenter",
          (event) => {
            if (
              event.pointerType ===
              "mouse"
            ) {
              hover = true;
              schedule();
            }
          }
        );

        wrapper.addEventListener(
          "pointerleave",
          () => {
            hover = false;
            schedule();
          }
        );

        wrapper.addEventListener(
          "focusin",
          schedule
        );

        wrapper.addEventListener(
          "focusout",
          () => {
            setTimeout(schedule, 0);
          }
        );

        track.addEventListener(
          "keydown",
          (event) => {
            if (
              mobile.matches &&
              [
                "ArrowLeft",
                "ArrowRight"
              ].includes(event.key)
            ) {
              event.preventDefault();

              go(
                event.key ===
                  "ArrowRight"
                  ? 1
                  : -1
              );
            }
          }
        );

        if (
          "IntersectionObserver" in
          window
        ) {
          new IntersectionObserver(
            ([entry]) => {
              visible =
                entry.isIntersecting;

              schedule();
            },
            {
              threshold: 0.3
            }
          ).observe(track);
        }

        document.addEventListener(
          "visibilitychange",
          schedule
        );

        reduced.addEventListener(
          "change",
          schedule
        );

        mobile.addEventListener(
          "change",
          () => {
            track.scrollTo({
              left: 0,
              behavior: "instant"
            });

            current = 0;
            nearest();
            schedule();
          }
        );

        nearest();
        schedule();
      });
  };

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );
  } else {
    init();
  }
})();

// Filas de productos: flechas, arrastre con mouse,
// deslizamiento táctil y avance automático.
document.querySelectorAll('.fila-productos').forEach((track, rowIndex) => {
  let frame = 0;
  let autoTimer = 0;
  let dragging = false;
  let moved = false;
  let suppressClick = false;
  let startX = 0;
  let startScroll = 0;

  let carousel = track.parentElement;

  // Crear contenedor para colocar las flechas.
  if (!carousel.classList.contains('carrusel-productos-fila')) {
    carousel = document.createElement('div');
    carousel.className = 'carrusel-productos-fila';

    track.before(carousel);
    carousel.append(track);
  }

  if (!track.id) {
    track.id = `fila-productos-${rowIndex + 1}`;
  }

  // Crear las flechas laterales.
  const crearFlecha = (direccion, simbolo, etiqueta) => {
    const boton = document.createElement('button');

    boton.type = 'button';
    boton.className =
      `control-productos-fila control-productos-fila--${direccion}`;

    boton.innerHTML = `<span aria-hidden="true">${simbolo}</span>`;
    boton.setAttribute('aria-label', etiqueta);
    boton.setAttribute('aria-controls', track.id);

    carousel.append(boton);

    return boton;
  };

  const anterior = crearFlecha(
    'anterior',
    '&lsaquo;',
    'Ver productos anteriores'
  );

  const siguiente = crearFlecha(
    'siguiente',
    '&rsaquo;',
    'Ver más productos'
  );

  // Obtener la posición exacta de cada tarjeta.
  const obtenerPosiciones = () => {
    const tarjetas = [
      ...track.querySelectorAll('.producto-destacado')
    ];

    const inicio = tarjetas[0]?.offsetLeft || 0;

    return tarjetas.map(
      tarjeta => tarjeta.offsetLeft - inicio
    );
  };

  // Comprobar si el usuario prefiere menos animaciones.
  const movimientoReducido = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  // Mover una tarjeta hacia adelante o hacia atrás.
  const moverCarrusel = direccion => {
    const posiciones = obtenerPosiciones();
    const posicionActual = Math.max(0, track.scrollLeft);

    const destino = direccion > 0
      ? posiciones.find(posicion => posicion > posicionActual + 4)
      : [...posiciones]
          .reverse()
          .find(posicion => posicion < posicionActual - 4);

    track.scrollTo({
      left:
        destino ??
        (direccion > 0 ? track.scrollWidth : 0),

      behavior: movimientoReducido.matches
        ? 'auto'
        : 'smooth'
    });
  };

  // Pausar el movimiento automático.
  const pausarAutomatico = () => {
    clearTimeout(autoTimer);
  };

  // Deslizamiento automático cada 5.2 segundos.
  const iniciarAutomatico = () => {
    pausarAutomatico();

    if (
      movimientoReducido.matches ||
      document.hidden ||
      carousel.matches(':hover') ||
      carousel.contains(document.activeElement)
    ) {
      return;
    }

    autoTimer = setTimeout(() => {
      const llegoAlFinal =
        track.scrollLeft >=
        track.scrollWidth - track.clientWidth - 4;

      if (llegoAlFinal) {
        track.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      } else {
        moverCarrusel(1);
      }

      iniciarAutomatico();
    }, 5200);
  };

  // Funcionamiento de las flechas.
  anterior.addEventListener('click', () => {
    moverCarrusel(-1);
    iniciarAutomatico();
  });

  siguiente.addEventListener('click', () => {
    moverCarrusel(1);
    iniciarAutomatico();
  });

  // Pausar mientras el usuario interactúa.
  carousel.addEventListener(
    'mouseenter',
    pausarAutomatico
  );

  carousel.addEventListener(
    'mouseleave',
    iniciarAutomatico
  );

  carousel.addEventListener(
    'focusin',
    pausarAutomatico
  );

  carousel.addEventListener(
    'focusout',
    iniciarAutomatico
  );

  track.addEventListener(
    'touchstart',
    pausarAutomatico,
    { passive: true }
  );

  track.addEventListener(
    'touchend',
    iniciarAutomatico,
    { passive: true }
  );

  document.addEventListener(
    'visibilitychange',
    iniciarAutomatico
  );

  // Mostrar u ocultar las flechas según la posición.
  const actualizarControles = () => {
    const maximo = Math.max(
      0,
      track.scrollWidth - track.clientWidth
    );

    const posicion = Math.max(0, track.scrollLeft);

    track.classList.toggle(
      'tiene-desborde-izquierda',
      posicion > 4
    );

    track.classList.toggle(
      'tiene-desborde-derecha',
      posicion < maximo - 4
    );

    anterior.disabled =
      maximo < 5 || posicion <= 4;

    siguiente.disabled =
      maximo < 5 || posicion >= maximo - 4;
  };

  const solicitarActualizacion = () => {
    cancelAnimationFrame(frame);

    frame = requestAnimationFrame(
      actualizarControles
    );
  };

  track.addEventListener(
    'scroll',
    solicitarActualizacion,
    { passive: true }
  );

  if ('ResizeObserver' in window) {
    new ResizeObserver(
      solicitarActualizacion
    ).observe(track);
  } else {
    window.addEventListener(
      'resize',
      solicitarActualizacion
    );
  }

  // Permitir arrastrar el carrusel con el mouse.
  track.addEventListener('pointerdown', evento => {
    if (
      evento.pointerType !== 'mouse' ||
      evento.button !== 0 ||
      evento.target.closest('a, button, input')
    ) {
      return;
    }

    dragging = true;
    moved = false;
    startX = evento.clientX;
    startScroll = track.scrollLeft;

    pausarAutomatico();

    track.classList.add('esta-arrastrando');
    track.setPointerCapture(evento.pointerId);
  });

  track.addEventListener('pointermove', evento => {
    if (!dragging) return;

    const distancia = evento.clientX - startX;

    if (Math.abs(distancia) > 5) {
      moved = true;
    }

    track.scrollLeft = startScroll - distancia;
  });

  const terminarArrastre = evento => {
    if (!dragging) return;

    dragging = false;
    suppressClick = moved;

    track.classList.remove('esta-arrastrando');

    if (track.hasPointerCapture(evento.pointerId)) {
      track.releasePointerCapture(evento.pointerId);
    }

    // Acomodar la tarjeta más cercana.
    if (moved) {
      const posiciones = obtenerPosiciones();

      const posicionCercana = posiciones.reduce(
        (mejor, posicion) => {
          const distanciaActual = Math.abs(
            posicion - track.scrollLeft
          );

          const mejorDistancia = Math.abs(
            mejor - track.scrollLeft
          );

          return distanciaActual < mejorDistancia
            ? posicion
            : mejor;
        },
        posiciones[0] || 0
      );

      track.scrollTo({
        left: posicionCercana,
        behavior: movimientoReducido.matches
          ? 'auto'
          : 'smooth'
      });
    }

    iniciarAutomatico();

    setTimeout(() => {
      suppressClick = false;
    }, 0);
  };

  track.addEventListener(
    'pointerup',
    terminarArrastre
  );

  track.addEventListener(
    'pointercancel',
    terminarArrastre
  );

  // Evitar abrir un enlace accidentalmente al arrastrar.
  track.addEventListener(
    'click',
    evento => {
      if (!suppressClick) return;

      evento.preventDefault();
      evento.stopPropagation();
    },
    true
  );

  // Animación inicial de las tarjetas.
  track
    .querySelectorAll('.producto-destacado')
    .forEach((tarjeta, indice) => {
      if (
        movimientoReducido.matches ||
        !tarjeta.animate
      ) {
        return;
      }

      tarjeta.animate(
        [
          {
            opacity: 0,
            transform: 'translateX(14px)'
          },
          {
            opacity: 1,
            transform: 'translateX(0)'
          }
        ],
        {
          duration: 380,
          delay: Math.min(indice * 35, 210),
          easing: 'cubic-bezier(.2,.8,.2,1)',
          fill: 'both'
        }
      );
    });

  solicitarActualizacion();
  iniciarAutomatico();
});
document.querySelectorAll('button, a, [role="button"]').forEach(elemento => {
  const texto = elemento.textContent.trim().toLowerCase();

  if (texto === 'pausar' || texto === 'reanudar') {
    elemento.remove();
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const imagenes = document.querySelectorAll(
    ".ad-gallery .ad-work .ad-media img"
  );

  if (!imagenes.length || document.querySelector(".ad-image-modal")) return;

  const modal = document.createElement("div");
  modal.className = "ad-image-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Vista ampliada de la imagen");

  modal.innerHTML = `
    <button
      class="ad-image-modal__close"
      type="button"
      aria-label="Cerrar imagen ampliada"
    >×</button>

    <img src="" alt="">
  `;

  document.body.appendChild(modal);

  const imagenModal = modal.querySelector("img");
  const botonCerrar = modal.querySelector(".ad-image-modal__close");
  let ultimoElementoActivo = null;

  function abrirZoom(imagen) {
    ultimoElementoActivo = document.activeElement;
    imagenModal.src = imagen.currentSrc || imagen.src;
    imagenModal.alt = imagen.alt || "Imagen ampliada";
    modal.classList.add("is-open");
    document.body.classList.add("ad-no-scroll");
    botonCerrar.focus();
  }

  function cerrarZoom() {
    modal.classList.remove("is-open");
    document.body.classList.remove("ad-no-scroll");
    imagenModal.src = "";

    if (ultimoElementoActivo) {
      ultimoElementoActivo.focus();
    }
  }

  imagenes.forEach((imagen) => {
    const contenedor = imagen.closest(".ad-media");
    if (!contenedor) return;

    const botonZoom = document.createElement("button");
    botonZoom.className = "ad-zoom-button";
    botonZoom.type = "button";
    botonZoom.setAttribute(
      "aria-label",
      `Ampliar ${imagen.alt || "imagen"}`
    );
    botonZoom.innerHTML = "⌕";

    contenedor.appendChild(botonZoom);

    botonZoom.addEventListener("click", () => abrirZoom(imagen));
    imagen.addEventListener("click", () => abrirZoom(imagen));
  });

  botonCerrar.addEventListener("click", cerrarZoom);

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) cerrarZoom();
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && modal.classList.contains("is-open")) {
      cerrarZoom();
    }
  });
});
/* Navegación de categorías: el fragmento nativo conserva recarga e historial. */
(() => {
  const initCategoryNavigation = () => {
    document.documentElement.classList.add('ad-nav-ready');
    const header = document.querySelector('.cabecera');
    const menu = document.getElementById('menu-principal');
    const toggle = document.querySelector('.boton-menu');
    const offset = () => {
      const height = header?.getBoundingClientRect().height || 0;
      document.documentElement.style.setProperty('--ad-anchor-offset', `${height + 20}px`);
    };
    offset();
    if (header && 'ResizeObserver' in window) new ResizeObserver(offset).observe(header);
    else window.addEventListener('resize', offset);
    const close = () => {
      menu?.classList.remove('menu-principal-abierto');
      toggle?.setAttribute('aria-expanded', 'false');
      const icon = toggle?.querySelector('[aria-hidden]');
      const label = toggle?.querySelector('.sr-only');
      if (icon) icon.textContent = '☰';
      if (label) label.textContent = 'Abrir menú';
      menu?.querySelectorAll('.menu-desplegable').forEach(item => {
        item.classList.remove('menu-abierto');
        item.querySelector('button')?.setAttribute('aria-expanded', 'false');
      });
    };
    const currentTarget = () => {
      try { return document.getElementById(decodeURIComponent(location.hash.slice(1))); }
      catch { return null; }
    };
    const sync = () => {
      const target = currentTarget();
      document.querySelectorAll('.ad-category-links a, .menu-desplegable__panel a').forEach(link => {
        const url = new URL(link.href, location.href);
        if (url.pathname === location.pathname && url.hash && url.hash === location.hash) link.setAttribute('aria-current', 'location');
        else if (link.getAttribute('aria-current') === 'location') link.removeAttribute('aria-current');
      });
      if (!target) return;
      close();
      offset();
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({preventScroll:true});
    };
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const url = new URL(link.href, location.href);
      if (menu?.contains(link)) close();
      if (url.origin === location.origin && url.pathname === location.pathname && url.hash === location.hash && url.hash) sync();
    });
    window.addEventListener('hashchange', sync);
    sync();
    window.addEventListener('load', () => {
      offset();
      const target = currentTarget();
      if (target) target.scrollIntoView({behavior:'instant', block:'start'});
    }, {once:true});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCategoryNavigation, {once:true});
  else initCategoryNavigation();
})();
