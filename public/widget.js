(function () {
    // ── Config ──────────────────────────────────────────────────────────
    const WIDGET_URL  = "https://tudominio.com/widget";   // ← cambia en producción
    const ACCENT      = document.currentScript?.getAttribute("data-color")  || "#1d4ed8";
    const BTN_LABEL   = document.currentScript?.getAttribute("data-label")  || "Roof Quote";
    const POSITION    = document.currentScript?.getAttribute("data-position") || "right"; // "right" | "left"

    // ── Estilos ──────────────────────────────────────────────────────────
    const css = `
        #rq-launcher {
            position: fixed;
            bottom: 24px;
            ${POSITION === "left" ? "left: 24px;" : "right: 24px;"}
            z-index: 99999;
            display: flex;
            flex-direction: column;
            align-items: ${POSITION === "left" ? "flex-start" : "flex-end"};
            gap: 12px;
            font-family: system-ui, sans-serif;
        }
        #rq-panel {
            width: 420px;
            max-width: calc(100vw - 32px);
            height: 640px;
            max-height: calc(100vh - 100px);
            border: none;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.18);
            transition: opacity 0.2s ease, transform 0.2s ease;
            background: white;
        }
        #rq-panel.rq-hidden {
            opacity: 0;
            pointer-events: none;
            transform: translateY(12px);
        }
        #rq-btn {
            background: ${ACCENT};
            color: white;
            border: none;
            border-radius: 999px;
            padding: 14px 22px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 8px;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            white-space: nowrap;
        }
        #rq-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 24px rgba(0,0,0,0.25);
        }
        #rq-btn svg { flex-shrink: 0; }
    `;

    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    // ── DOM ───────────────────────────────────────────────────────────────
    const launcher = document.createElement("div");
    launcher.id = "rq-launcher";

    // iframe
    const iframe = document.createElement("iframe");
    iframe.id  = "rq-panel";
    iframe.src = WIDGET_URL;
    iframe.classList.add("rq-hidden");
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("title", "Roofing Quote Widget");

    // botón
    const btn = document.createElement("button");
    btn.id = "rq-btn";
    btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
            <polyline points="9 21 9 12 15 12 15 21"/>
        </svg>
        <span>${BTN_LABEL}</span>
    `;

    launcher.appendChild(iframe);
    launcher.appendChild(btn);
    document.body.appendChild(launcher);

    // ── Lógica abrir/cerrar ───────────────────────────────────────────────
    let isOpen = false;

    btn.addEventListener("click", () => {
        isOpen = !isOpen;
        iframe.classList.toggle("rq-hidden", !isOpen);
        btn.querySelector("span").textContent = isOpen ? "Close" : BTN_LABEL;
    });

    // Cierra si el usuario hace click fuera del launcher
    document.addEventListener("click", (e) => {
        if (isOpen && !launcher.contains(e.target)) {
            isOpen = false;
            iframe.classList.add("rq-hidden");
            btn.querySelector("span").textContent = BTN_LABEL;
        }
    });
})();