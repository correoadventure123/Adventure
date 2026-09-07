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