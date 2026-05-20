# ExamLock Presentation

SPA con tres tabs: Presentación (20 slides), Simulador en Vivo (25 alumnos), Análisis de Costos GCP.

## Requisito: servidor HTTP estático

Los módulos ES (`type="module"`) no funcionan con `file://`. Iniciar servidor desde esta carpeta:

```bash
python3 -m http.server 8080
# Abrir: http://localhost:8080
```

O con Node.js:

```bash
npx serve .
```

## Estructura

```
docs/presentation/
├── index.html              # Shell SPA con tabs (#presentation, #simulator, #costs)
├── assets/
│   ├── css/                # base, layout, components, animations
│   ├── js/core/            # tabs, eventBus
│   ├── js/shared/          # audio (WebAudio API)
│   ├── presentation/       # slides.js (20 slides), flowAnimator.js, presentation.js
│   ├── simulator/          # 25 alumnos, playbackController rAF, networkCanvas SVG
│   └── costs/              # costModel.js, charts.js, budgetSimulator.js, costs.js
└── data/
    └── pricing.json        # precios GCP (mayo 2026) y escenarios precalculados
```

## Atajos de teclado

| Contexto | Tecla | Acción |
|---|---|---|
| Presentación | `←` / `→` | Slide anterior/siguiente |
| Presentación | `S` | Toggle sidebar |
| Simulador | `Espacio` | Play / Pause |
| Simulador | `←` / `→` | ±5 segundos |
| Simulador | `Shift+←/→` | Evento anterior/siguiente |
| Simulador | `1`–`6` | Velocidad preset (0.5x→500x) |
