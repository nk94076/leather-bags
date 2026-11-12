(function () {
  "use strict";

  // ---- Mobile menu ----
  const mobileBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileClose = document.getElementById("mobile-menu-close");
  const mobileOverlay = document.getElementById("mobile-menu-overlay");
  function toggleMobileMenu(show) {
    if (!mobileMenu) return;
    mobileMenu.classList.toggle("hidden", !show);
  }
  mobileBtn && mobileBtn.addEventListener("click", () => toggleMobileMenu(true));
  mobileClose && mobileClose.addEventListener("click", () => toggleMobileMenu(false));
  mobileOverlay && mobileOverlay.addEventListener("click", () => toggleMobileMenu(false));

  // ---- Search panel + live suggestions ----
  const searchToggleBtn = document.getElementById("search-toggle-btn");
  const searchCloseBtn = document.getElementById("search-close-btn");
  const searchPanel = document.getElementById("search-panel");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  function toggleSearch(show) {
    if (!searchPanel) return;
    searchPanel.classList.toggle("hidden", !show);
    if (show && searchInput) searchInput.focus();
  }
  searchToggleBtn && searchToggleBtn.addEventListener("click", () => toggleSearch(searchPanel.classList.contains("hidden")));
  searchCloseBtn && searchCloseBtn.addEventListener("click", () => toggleSearch(false));

  let searchDebounce = null;
  searchInput &&
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim();
      clearTimeout(searchDebounce);
      if (q.length < 2) {
        searchResults.classList.add("hidden");
        searchResults.innerHTML = "";
        return;
      }
      searchDebounce = setTimeout(async () => {
        try {
          const res = await fetch(window.APP_BASE_URL + "search-suggestions?q=" + encodeURIComponent(q));
          const data = await res.json();
          renderSearchResults(data, q);
        } catch (e) {
          /* ignore */
        }
      }, 250);
    });

  function renderSearchResults(data, q) {
    const products = data.products || [];
    const categories = data.categories || [];
    if (products.length === 0 && categories.length === 0) {
      searchResults.innerHTML = '<p class="py-4 text-sm text-black/40">No results for "' + escapeHtml(q) + '"</p>';
      searchResults.classList.remove("hidden");
      return;
    }
    let html = '<div class="flex flex-col gap-6 sm:flex-row sm:gap-10">';
    if (categories.length) {
      html += '<div class="sm:w-52"><p class="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">Categories</p><div class="flex flex-col gap-1">';
      categories.forEach((c) => {
        html += `<a href="${window.APP_BASE_URL}shop/${c.slug}" class="rounded-lg px-2 py-1.5 text-sm text-brand-ink hover:bg-brand-cream">${escapeHtml(c.name)}</a>`;
      });
      html += "</div></div>";
    }
    if (products.length) {
      html += '<div class="flex-1"><p class="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">Products</p><div class="flex flex-col gap-1">';
      products.forEach((p) => {
        html += `<a href="${window.APP_BASE_URL}product/${p.slug}" class="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-brand-cream">
          <div class="relative h-11 w-10 shrink-0 overflow-hidden rounded-lg bg-brand-cream-dark"><img src="${p.image}" alt="" class="h-full w-full object-cover"></div>
          <span class="flex-1 text-sm text-brand-ink">${escapeHtml(p.name)}</span>
          <span class="text-sm text-black/50">${p.priceFormatted}</span>
        </a>`;
      });
      html += `</div><a href="${window.APP_BASE_URL}shop?q=${encodeURIComponent(q)}" class="mt-3 inline-block text-xs font-medium text-brand-primary hover:underline">View all results for "${escapeHtml(q)}" →</a></div>`;
    }
    html += "</div>";
    searchResults.innerHTML = html;
    searchResults.classList.remove("hidden");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Announcement bar rotation ----
  const track = document.getElementById("announcement-track");
  if (track) {
    let messages = [];
    try {
      messages = JSON.parse(track.dataset.messages || "[]");
    } catch (e) {
      messages = [];
    }
    if (messages.length > 1) {
      let idx = 0;
      const textEl = document.getElementById("announcement-text");
      setInterval(() => {
        idx = (idx + 1) % messages.length;
        if (textEl) {
          textEl.style.opacity = 0;
          setTimeout(() => {
            textEl.textContent = messages[idx];
            textEl.style.opacity = 1;
          }, 200);
        }
      }, 4000);
      if (textEl) textEl.style.transition = "opacity 0.2s ease";
    }
  }

  // ---- FAQ accordion ----
  document.querySelectorAll("[data-accordion-trigger]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = document.getElementById(btn.dataset.accordionTrigger);
      const icon = btn.querySelector("[data-accordion-icon]");
      if (!panel) return;
      const isOpen = !panel.classList.contains("hidden");
      panel.classList.toggle("hidden", isOpen);
      if (icon) icon.classList.toggle("rotate-180", !isOpen);
    });
  });

  // ---- Product gallery thumbnails ----
  document.querySelectorAll("[data-gallery-thumb]").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const galleryMain = document.querySelector("[data-gallery-main]");
      if (!galleryMain) return;
      galleryMain.src = thumb.dataset.fullSrc || thumb.src;
      document.querySelectorAll("[data-gallery-thumb]").forEach((t) => t.classList.remove("border-brand-primary"));
      thumb.classList.add("border-brand-primary");
    });
  });

  // ---- Generic quantity stepper (works with a number input sibling) ----
  document.querySelectorAll("[data-qty-decrease]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.qtyDecrease);
      if (input) input.value = Math.max(1, parseInt(input.value || "1", 10) - 1);
    });
  });
  document.querySelectorAll("[data-qty-increase]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.qtyIncrease);
      const max = parseInt(input?.dataset.max || "99", 10);
      if (input) input.value = Math.min(max, parseInt(input.value || "1", 10) + 1);
    });
  });

  // ---- Generic "confirm before submit" for delete forms ----
  document.querySelectorAll("[data-confirm]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      if (!confirm(form.dataset.confirm || "Are you sure?")) {
        e.preventDefault();
      }
    });
  });

  // ---- Image zoom on hover (product gallery main image) ----
  const zoomWrap = document.querySelector("[data-zoom-wrap]");
  if (zoomWrap) {
    const img = zoomWrap.querySelector("img");
    zoomWrap.addEventListener("mousemove", (e) => {
      const rect = zoomWrap.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      img.style.transformOrigin = `${x}% ${y}%`;
      img.style.transform = "scale(1.9)";
    });
    zoomWrap.addEventListener("mouseleave", () => {
      img.style.transform = "scale(1)";
    });
  }

  // ---- Tab switcher (product page description/specs/reviews) ----
  document.querySelectorAll("[data-tabs]").forEach((tabGroup) => {
    const triggers = tabGroup.querySelectorAll("[data-tab-trigger]");
    triggers.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.tabTrigger;
        triggers.forEach((t) => {
          const active = t === btn;
          t.classList.toggle("text-brand-ink", active);
          t.classList.toggle("text-black/40", !active);
          const underline = t.querySelector("[data-tab-underline]");
          if (underline) underline.classList.toggle("hidden", !active);
        });
        tabGroup.querySelectorAll("[data-tab-panel]").forEach((panel) => {
          panel.classList.toggle("hidden", panel.dataset.tabPanel !== target);
        });
      });
    });
  });

  // ---- Toggle visibility (e.g. "Write a Review" form) ----
  document.querySelectorAll("[data-toggle-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.toggleTarget);
      if (target) target.classList.toggle("hidden");
    });
  });

  // ---- Copy product link to clipboard (share button) ----
  document.querySelectorAll("[data-copy-link]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copyLink);
        const original = btn.getAttribute("title");
        btn.setAttribute("title", "Link copied!");
        setTimeout(() => btn.setAttribute("title", original || "Share product"), 1500);
      } catch (e) {
        /* ignore */
      }
    });
  });

  // ---- Star rating picker (write a review form) ----
  document.querySelectorAll("[data-star-rating]").forEach((group) => {
    const hidden = document.getElementById(group.dataset.starRating);
    const stars = group.querySelectorAll("[data-star-value]");
    if (!hidden) return;
    function paint(n) {
      stars.forEach((s) => {
        const icon = s.querySelector("[data-star-icon]");
        const active = parseInt(s.dataset.starValue, 10) <= n;
        if (!icon) return;
        icon.setAttribute("fill", active ? "#C9A24B" : "none");
        icon.classList.toggle("text-brand-gold", active);
        icon.classList.toggle("text-black/20", !active);
      });
    }
    paint(parseInt(hidden.value || "5", 10));
    stars.forEach((s) => {
      s.addEventListener("click", () => {
        hidden.value = s.dataset.starValue;
        paint(parseInt(s.dataset.starValue, 10));
      });
    });
  });

  // ---- Color swatch selection (product page + admin forms) ----
  document.querySelectorAll("[data-color-select]").forEach((group) => {
    const hiddenInput = document.getElementById(group.dataset.colorSelect);
    group.querySelectorAll("[data-color-value]").forEach((swatch) => {
      swatch.addEventListener("click", () => {
        group.querySelectorAll("[data-color-value]").forEach((s) => s.classList.remove("ring-2", "ring-brand-primary", "scale-110"));
        swatch.classList.add("ring-2", "ring-brand-primary", "scale-110");
        if (hiddenInput) hiddenInput.value = swatch.dataset.colorValue;
        const label = document.getElementById(group.dataset.colorSelect + "-label");
        if (label) label.textContent = swatch.dataset.colorValue;
      });
    });
  });
})();
