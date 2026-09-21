/* Adventure — interacciones compartidas del sitio. */
(() => {
  "use strict";

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = matchMedia("(max-width: 760px)");
  const locals = [
    ["Huaycán · Local 1", "51972582415"],
    ["Huaycán · Local 2", "51965218983"],
    ["Chaclacayo · Local 3", "51974569098"]
  ];
  const scrollBehavior = () => reduceMotion.matches ? "auto" : "smooth";
  const onMediaChange = (query, callback) => {
    if (typeof query.addEventListener === "function") query.addEventListener("change", callback);
    else query.addListener?.(callback);
  };

  function initMenu() {
    const menu = document.getElementById("menu-principal");
    const toggle = document.querySelector(".boton-menu");
    const dropdowns = [...document.querySelectorAll(".menu-desplegable")];
    document.documentElement.classList.add("ad-nav-ready");

    const closeDropdowns = (exception = null) => dropdowns.forEach((dropdown) => {
      if (dropdown === exception) return;
      dropdown.classList.remove("menu-abierto");
      dropdown.querySelector(".menu-desplegable__boton")?.setAttribute("aria-expanded", "false");
    });
    const setOpen = (open) => {
      menu?.classList.toggle("menu-principal-abierto", open);
      toggle?.setAttribute("aria-expanded", String(open));
      const icon = toggle?.querySelector("[aria-hidden]");
      const label = toggle?.querySelector(".sr-only");
      if (icon) icon.textContent = open ? "×" : "☰";
      if (label) label.textContent = open ? "Cerrar menú" : "Abrir menú";
      if (!open) closeDropdowns();
    };

    toggle?.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    dropdowns.forEach((dropdown) => {
      const button = dropdown.querySelector(".menu-desplegable__boton");
      button?.addEventListener("click", () => {
        const open = !dropdown.classList.contains("menu-abierto");
        closeDropdowns(dropdown);
        dropdown.classList.toggle("menu-abierto", open);
        button.setAttribute("aria-expanded", String(open));
      });
    });
    menu?.addEventListener("click", (event) => { if (event.target.closest("a")) setOpen(false); });
    document.addEventListener("click", (event) => {
      if (!menu?.contains(event.target) && !toggle?.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      const wasOpen = toggle?.getAttribute("aria-expanded") === "true";
      const dropdown = document.activeElement?.closest(".menu-desplegable");
      setOpen(false);
      if (wasOpen && mobile.matches) toggle?.focus();
      else dropdown?.querySelector(".menu-desplegable__boton")?.focus();
    });
    onMediaChange(mobile, () => setOpen(false));
    return () => setOpen(false);
  }

  function initImages() {
    const wire = (image) => {
      if (image.dataset.imageReady) return;
      image.dataset.imageReady = "true";
      const box = image.parentElement;
      const update = () => {
        const loaded = image.complete && image.naturalWidth > 0;
        image.classList.toggle("ad-image-missing", !loaded);
        ["has-image", "imagen-disponible", "ad-image-loaded"].forEach((name) => box?.classList.toggle(name, loaded));
      };
      const fallback = () => {
        if (image.dataset.respaldo) {
          const source = image.dataset.respaldo;
          delete image.dataset.respaldo;
          image.src = source;
        } else update();
      };
      image.addEventListener("load", update);
      image.addEventListener("error", fallback);
      if (image.complete) (image.naturalWidth ? update : fallback)();
    };
    document.querySelectorAll("img.ad-pending-image, .ad-media img, .producto-destacado__imagen img").forEach(wire);
  }

  function initReveal() {
    const elements = document.querySelectorAll("[data-reveal]");
    if (!elements.length || reduceMotion.matches || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }), { threshold: 0.05 });
    elements.forEach((element) => {
      element.classList.add("ad-reveal-ready");
      observer.observe(element);
    });
    onMediaChange(reduceMotion, () => { if (reduceMotion.matches) observer.disconnect(); });
  }

  function initFilters() {
    document.querySelectorAll("[data-catalog]").forEach((catalog) => {
      const controls = catalog.querySelector(".ad-filters");
      const track = catalog.querySelector(".ad-products");
      const cards = [...catalog.querySelectorAll("[data-category]")];
      const status = catalog.querySelector("[data-filter-status]");
      if (!controls || !track || !cards.length) return;
      controls.hidden = false;
      controls.addEventListener("click", (event) => {
        const button = event.target.closest("[data-filter]");
        if (!button || button.getAttribute("aria-pressed") === "true") return;
        const filter = button.dataset.filter;
        let visible = 0;
        controls.querySelectorAll("[data-filter]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        cards.forEach((card) => {
          card.hidden = filter !== "todos" && card.dataset.category !== filter;
          if (!card.hidden) visible += 1;
        });
        track.scrollTo({ left: 0, behavior: "auto" });
        if (status) status.textContent = `${button.textContent.trim()}: ${visible} productos disponibles.`;
      });
    });
  }

  function initHeroCarousel() {
    document.querySelectorAll("[data-carrusel-categorias]").forEach((carousel) => {
      const track = carousel.querySelector(".carrusel-categorias__pista");
      const slides = [...carousel.querySelectorAll("[data-categoria-slide]")];
      if (!track || slides.length < 2) return;
      let index = 0;
      let timer = 0;
      let paused = false;
      const pause = document.createElement("button");
      pause.type = "button";
      pause.className = "ad-banner-pause";
      carousel.append(pause);

      const render = () => {
        track.style.transform = `translateX(-${index * 100}%)`;
        slides.forEach((slide, slideIndex) => {
          const active = slideIndex === index;
          slide.classList.toggle("is-active", active);
          slide.setAttribute("aria-hidden", String(!active));
          slide.querySelectorAll("a, button").forEach((item) => active ? item.removeAttribute("tabindex") : item.setAttribute("tabindex", "-1"));
        });
      };
      const stop = () => clearTimeout(timer);
      const schedule = () => {
        stop();
        if (paused || reduceMotion.matches || document.hidden || carousel.matches(":hover") || carousel.contains(document.activeElement)) return;
        timer = setTimeout(() => { index = (index + 1) % slides.length; render(); schedule(); }, 6000);
      };
      const setPaused = (value) => {
        paused = value;
        pause.textContent = paused ? "Reanudar" : "Pausar";
        pause.setAttribute("aria-pressed", String(paused));
        pause.setAttribute("aria-label", paused ? "Reanudar carrusel" : "Pausar carrusel");
        schedule();
      };
      const move = (direction) => { index = (index + direction + slides.length) % slides.length; render(); schedule(); };
      carousel.querySelector("[data-categoria-anterior]")?.addEventListener("click", () => move(-1));
      carousel.querySelector("[data-categoria-siguiente]")?.addEventListener("click", () => move(1));
      pause.addEventListener("click", () => setPaused(!paused));
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", schedule);
      carousel.addEventListener("focusin", stop);
      carousel.addEventListener("focusout", schedule);
      document.addEventListener("visibilitychange", schedule);
      onMediaChange(reduceMotion, schedule);
      render();
      setPaused(false);
    });
  }

  function initProductRows() {
    document.querySelectorAll(".fila-productos").forEach((track, rowIndex) => {
      let frame = 0;
      let dragging = false;
      let dragged = false;
      let suppressClick = false;
      let startX = 0;
      let startScroll = 0;
      let wrapper = track.parentElement;
      if (!wrapper.classList.contains("carrusel-productos-fila")) {
        wrapper = document.createElement("div");
        wrapper.className = "carrusel-productos-fila";
        track.before(wrapper);
        wrapper.append(track);
      }
      if (!track.id) track.id = `fila-productos-${rowIndex + 1}`;
      const createButton = (direction, symbol, label) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `control-productos-fila control-productos-fila--${direction}`;
        button.innerHTML = `<span aria-hidden="true">${symbol}</span>`;
        button.setAttribute("aria-label", label);
        button.setAttribute("aria-controls", track.id);
        wrapper.append(button);
        return button;
      };
      const previous = createButton("anterior", "‹", "Ver productos anteriores");
      const next = createButton("siguiente", "›", "Ver más productos");
      const positions = () => {
        const cards = [...track.querySelectorAll(".producto-destacado:not([hidden])")];
        const origin = cards[0]?.offsetLeft || 0;
        return cards.map((card) => card.offsetLeft - origin);
      };
      const update = () => {
        const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
        const position = Math.max(0, track.scrollLeft);
        track.classList.toggle("tiene-desborde-izquierda", position > 4);
        track.classList.toggle("tiene-desborde-derecha", position < maximum - 4);
        previous.disabled = maximum < 5 || position <= 4;
        next.disabled = maximum < 5 || position >= maximum - 4;
      };
      const requestUpdate = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
      const move = (direction) => {
        const points = positions();
        const current = Math.max(0, track.scrollLeft);
        const destination = direction > 0 ? points.find((point) => point > current + 4) : [...points].reverse().find((point) => point < current - 4);
        track.scrollTo({ left: destination ?? (direction > 0 ? track.scrollWidth : 0), behavior: scrollBehavior() });
      };
      previous.addEventListener("click", () => move(-1));
      next.addEventListener("click", () => move(1));
      track.addEventListener("scroll", requestUpdate, { passive: true });
      track.addEventListener("pointerdown", (event) => {
        if (event.pointerType !== "mouse" || event.button !== 0 || event.target.closest("a, button, input, summary, details")) return;
        dragging = true; dragged = false; startX = event.clientX; startScroll = track.scrollLeft;
        track.classList.add("esta-arrastrando");
        track.setPointerCapture(event.pointerId);
      });
      track.addEventListener("pointermove", (event) => {
        if (!dragging) return;
        const distance = event.clientX - startX;
        dragged ||= Math.abs(distance) > 5;
        track.scrollLeft = startScroll - distance;
      });
      const finish = (event) => {
        if (!dragging) return;
        dragging = false; suppressClick = dragged; track.classList.remove("esta-arrastrando");
        if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
        if (dragged) {
          const points = positions();
          const nearest = points.reduce((best, point) => Math.abs(point - track.scrollLeft) < Math.abs(best - track.scrollLeft) ? point : best, points[0] || 0);
          track.scrollTo({ left: nearest, behavior: scrollBehavior() });
        }
        setTimeout(() => { suppressClick = false; }, 0);
      };
      track.addEventListener("pointerup", finish);
      track.addEventListener("pointercancel", finish);
      track.addEventListener("click", (event) => {
        if (!suppressClick) return;
        event.preventDefault(); event.stopPropagation();
      }, true);
      if ("ResizeObserver" in window) new ResizeObserver(requestUpdate).observe(track);
      else addEventListener("resize", requestUpdate, { passive: true });
      requestUpdate();
    });
  }

  function initStepCarousels() {
    document.querySelectorAll("[data-step-carousel]").forEach((carousel) => {
      const track = carousel.querySelector("[data-steps]");
      const steps = [...(track?.children || [])];
      const controls = carousel.querySelector(".ad-step-controls");
      const previous = carousel.querySelector("[data-step-prev]");
      const next = carousel.querySelector("[data-step-next]");
      const status = carousel.querySelector("[data-step-status]");
      carousel.querySelector("[data-step-pause]")?.remove();
      if (!track || !controls || steps.length < 2) return;
      let index = 0;
      controls.hidden = false;
      const update = () => {
        index = Math.max(0, Math.min(steps.length - 1, Math.round(track.scrollLeft / Math.max(track.clientWidth, 1))));
        if (status) status.textContent = `${index + 1} / ${steps.length}`;
        if (previous) previous.disabled = index === 0;
        if (next) next.disabled = index === steps.length - 1;
      };
      const move = (direction) => {
        index = Math.max(0, Math.min(steps.length - 1, index + direction));
        track.scrollTo({ left: steps[index].offsetLeft - (steps[0]?.offsetLeft || 0), behavior: scrollBehavior() });
      };
      previous?.addEventListener("click", () => move(-1));
      next?.addEventListener("click", () => move(1));
      track.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
      update();
    });
  }

  function initConsultations() {
    if (!document.querySelector("a[data-consulta]") || !("HTMLDialogElement" in window)) return;
    const dialog = document.createElement("dialog");
    dialog.className = "ad-consult-dialog";
    dialog.innerHTML = '<form method="dialog"><button class="ad-dialog-close" aria-label="Cerrar selección de local">×</button></form><h2>Elige tu local</h2><p class="ad-consult-name"></p><div class="ad-consult-options"></div>';
    document.body.append(dialog);
    const subjectLabel = dialog.querySelector(".ad-consult-name");
    const options = dialog.querySelector(".ad-consult-options");
    let returnFocus = null;

    locals.forEach(([name]) => {
      const link = document.createElement("a");
      link.className = "ad-button";
      link.textContent = name;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      options.append(link);
    });
    const getSubject = (link) => {
      const card = link.closest("article");
      let subject = card?.querySelector("h4, h3, h2")?.textContent.trim() || "nuestros servicios";
      if (/^Producto(?:\s+\d+| por definir)?$/i.test(subject)) {
        subject = card?.querySelector(".producto-destacado__etiqueta, .ad-meta")?.textContent.trim() || "productos disponibles";
      }
      return subject;
    };
    const whatsapp = ([name, phone], subject) => `https://wa.me/${phone}?text=${encodeURIComponent(`Hola, consulto por ${subject} en ${name}.`)}`;

    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[data-consulta]");
      if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const subject = getSubject(link);
      const localIndex = Number(document.body.dataset.local);
      if (localIndex >= 1 && localIndex <= locals.length) {
        link.href = whatsapp(locals[localIndex - 1], subject);
        return;
      }
      event.preventDefault();
      returnFocus = link;
      subjectLabel.textContent = `Consulta: ${subject}`;
      [...options.children].forEach((option, index) => { option.href = whatsapp(locals[index], subject); });
      dialog.showModal();
      document.body.classList.add("ad-no-scroll");
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("ad-no-scroll");
      returnFocus?.focus();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  }

  function initImageZoom() {
    const images = [...document.querySelectorAll(".ad-gallery .ad-work .ad-media img")];
    if (!images.length) return;
    const modal = document.createElement("div");
    modal.className = "ad-image-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Vista ampliada de la imagen");
    modal.innerHTML = '<button class="ad-image-modal__close" type="button" aria-label="Cerrar imagen ampliada">×</button><img alt="">';
    document.body.append(modal);
    const modalImage = modal.querySelector("img");
    const closeButton = modal.querySelector("button");
    let returnFocus = null;

    const open = (image, trigger) => {
      if (!image.complete || !image.naturalWidth) return;
      returnFocus = trigger;
      modalImage.src = image.currentSrc || image.src;
      modalImage.alt = image.alt || "Imagen ampliada";
      modal.classList.add("is-open");
      document.body.classList.add("ad-no-scroll");
      [...document.body.children].forEach((element) => { if (element !== modal) element.inert = true; });
      closeButton.focus();
    };
    const close = () => {
      modal.classList.remove("is-open");
      document.body.classList.remove("ad-no-scroll");
      modalImage.removeAttribute("src");
      [...document.body.children].forEach((element) => { if (element !== modal) element.inert = false; });
      returnFocus?.focus();
    };
    images.forEach((image) => {
      const button = document.createElement("button");
      button.className = "ad-zoom-button";
      button.type = "button";
      button.setAttribute("aria-label", `Ampliar ${image.alt || "imagen"}`);
      button.innerHTML = '<span aria-hidden="true">⌕</span>';
      image.closest(".ad-media")?.append(button);
      button.addEventListener("click", () => open(image, button));
    });
    closeButton.addEventListener("click", close);
    modal.addEventListener("click", (event) => { if (event.target === modal) close(); });
    modal.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab") { event.preventDefault(); closeButton.focus(); }
    });
  }

  function initHashNavigation(closeMenu) {
    const header = document.querySelector(".cabecera");
    const updateOffset = () => {
      const height = header?.getBoundingClientRect().height || 0;
      document.documentElement.style.setProperty("--ad-anchor-offset", `${height + 20}px`);
    };
    const sync = () => {
      document.querySelectorAll('.ad-category-links a, .menu-desplegable__panel a').forEach((link) => {
        const url = new URL(link.href, location.href);
        const current = url.pathname === location.pathname && url.hash === location.hash && Boolean(url.hash);
        if (current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      if (!location.hash) return;
      closeMenu();
      updateOffset();
    };
    updateOffset();
    if (header && "ResizeObserver" in window) new ResizeObserver(updateOffset).observe(header);
    else addEventListener("resize", updateOffset, { passive: true });
    addEventListener("hashchange", sync);
    sync();
  }

  function initPrintButtons() {
    document.querySelectorAll("[data-print-page]").forEach((button) => {
      button.addEventListener("click", () => window.print());
    });
  }

  const init = () => {
    const closeMenu = initMenu();
    initImages();
    initReveal();
    initFilters();
    initHeroCarousel();
    initProductRows();
    initStepCarousels();
    initConsultations();
    initImageZoom();
    initHashNavigation(closeMenu);
    initPrintButtons();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
