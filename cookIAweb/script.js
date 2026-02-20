document.getElementById("formReceta")
    .addEventListener("submit", function (e) {
        e.preventDefault();
        buscarReceta();
    });

async function buscarReceta() {
    const ingrediente = document.getElementById("ingrediente").value;
    const objetivo = document.getElementById("objetivo").value;
    const div = document.getElementById("resultado");

    div.innerHTML = `<p style="color:var(--gold-main); text-align:center; letter-spacing:3px; font-size:0.8rem; margin-top:40px;">Iniciando síntesis culinaria...</p>`;

    try {
        const response = await fetch("https://localhost:7288/api/Recipe/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ingredientes: [ingrediente],
                objetivo: objetivo
            })
        });

        if (!response.ok) throw new Error("Error en la respuesta del servidor");

        const data = await response.json();
        mostrarResultado(data);

    } catch (error) {
        div.innerHTML = `<p style="color:red; text-align:center;">${error.message}</p>`;
    }
}

function mostrarResultado(data) {
    const div = document.getElementById("resultado");

    const ingredientesHtml = data.ingredientes
        ? data.ingredientes.map(i => `<li>${i.nombre} — <span>${i.medida}</span></li>`).join("")
        : "<li>Sin información</li>";

    const sustitucionesHtml = data.sustituciones?.length
        ? data.sustituciones.map(s => `<li>${s}</li>`).join("")
        : "<li>No necesarias</li>";

    const listaPasos = data.instrucciones
        .split(/(?:\d+\.|\n|(?<=[.!?])\s+(?=[A-Z]))/)
        .map(p => p.trim())
        .filter(p => p.length > 10);

    const instruccionesHtml = listaPasos.map((paso, index) => `
        <div class="paso-card">
            <div class="paso-header">PASO 0${index + 1}</div>
            <div class="paso-content">${paso}</div>
        </div>
    `).join("");

    div.innerHTML = `
    <div class="recipe-card">

        <!-- ── PANEL IZQUIERDO: Ingredientes & Sustituciones ── -->
        <div class="side-panel-left">

            <div class="accordion active">
                <div class="accordion-header">INGREDIENTES</div>
                <div class="accordion-body">
                    <ul>${ingredientesHtml}</ul>
                </div>
            </div>

            <div class="accordion">
                <div class="accordion-header">SUSTITUCIONES</div>
                <div class="accordion-body">
                    <ul>${sustitucionesHtml}</ul>
                </div>
            </div>

        </div>

        <!-- ── CENTRO: Header de la receta ── -->
        <div class="recipe-header">
            <h2>${data.nombre}</h2>
            <img src="${data.imagenUrl}" alt="${data.nombre}" />
            <div class="recipe-meta">
                <span>${data.categoria}</span>
                <span>•</span>
                <span>Dificultad: ${data.nivelDificultad}</span>
            </div>
            <div class="recipe-recommendation">
                <strong>Nota del chef</strong>
                <p>${data.recomendacionIA}</p>
            </div>
        </div>

        <!-- ── PANEL DERECHO: Procedimiento ── -->
        <div class="side-panel-right">

            <div class="accordion active">
                <div class="accordion-header">PROCEDIMIENTO</div>
                <div class="accordion-body">
                    ${instruccionesHtml}
                </div>
            </div>

        </div>

    </div>
    `;

    // Activar acordeones
    document.querySelectorAll(".accordion-header").forEach(header => {
        header.addEventListener("click", () => {
            const accordion = header.parentElement;
            // Solo colapsar los del mismo panel, no globalmente
            const panel = accordion.closest('.side-panel-left, .side-panel-right');
            if (panel) {
                panel.querySelectorAll(".accordion").forEach(a => {
                    if (a !== accordion) a.classList.remove("active");
                });
            }
            accordion.classList.toggle("active");
        });
    });
}