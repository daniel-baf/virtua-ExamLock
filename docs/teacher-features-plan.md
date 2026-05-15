# Plan de funciones nuevas para docente

## Resumen

- Implementar en fases, priorizando operación en vivo: alertas, panel de problemas, plantillas de sesión y captura automática configurable.
- Mantener el modelo actual de backend/dashboard/agente, agregando campos compatibles a `sessions`, `students` y `events`.
- Evitar cambios grandes en la ISO salvo para captura automática por sesión, donde el agente debe obedecer configuración recibida desde el servidor.

## Fase 1: Alertas y panel de problemas

- Agregar estado derivado por alumno en el dashboard:
  - `offline`
  - `screenshotError`
  - `streamError`
  - `staleScreenshot`
  - `reconnected`
  - `browserClosed`
- Agregar pestaña `Alertas` en monitoreo con alumnos que requieren atención.
- Registrar y mostrar eventos en vivo:
  - alumno offline
  - alumno reconectado
  - captura fallida
  - stream fallido
  - navegador cerrado
  - readmisión
- Agregar indicadores visuales en `StudentCard`: alerta roja/amarilla y texto corto del problema.
- Backend:
  - reutilizar `events` para auditoría
  - emitir eventos Socket.IO nuevos o normalizar los existentes para que el dashboard actualice la UI sin recargar

## Fase 2: Timeline en vivo y mensajes rápidos

- Extender el drawer/historial del alumno para mostrar timeline en vivo, no solo screenshots.
- Reutilizar `GET /api/session/:id/audit` o crear un endpoint liviano `GET /api/student/:uid/events`.
- Agregar mensajes rápidos predefinidos en `MessageDialog`:
  - `Quedan 10 minutos`
  - `Revisa tu conexión`
  - `No cierres el navegador`
  - `Levanta la mano si tienes problema`
- Mantener mensaje libre.
- Registrar cada mensaje enviado como evento `message`.

## Fase 3: Plantillas de sesión

- Crear modelo de plantilla local en dashboard, guardado en cookie/local storage:
  - nombre de plantilla
  - duración
  - `blockInternet`
  - whitelist con toggles
  - captura automática
  - mensajes rápidos opcionales
- En `Nueva sesión`, agregar:
  - `Guardar como plantilla`
  - `Cargar plantilla`
  - `Eliminar plantilla`
- No sincronizar plantillas entre docentes en esta fase.
- Mantener la lista default institucional del servidor como fuente base independiente de las plantillas locales.

## Fase 4: Captura automática configurable por sesión

- Agregar campo en `sessions`:
  - `screenshotIntervalMs`, con valores permitidos: apagado, 30s, 1min, 5min.
- En creación y monitoreo de sesión, agregar control para cambiar intervalo.
- Backend:
  - guardar el intervalo en sesión
  - emitir `server:screenshot-config` al agente cuando cambie
  - incluir el intervalo en `server:admitted`
- Agente:
  - reemplazar el intervalo global fijo por configuración recibida desde la sesión
  - reiniciar timer cuando llegue una nueva configuración
  - no capturar si el intervalo está apagado
- Auditoría:
  - registrar cambios de intervalo como `screenshot-config-updated`

## Fase 5: Exportación de auditoría

- Agregar botones en auditoría:
  - exportar CSV
  - exportar JSON
- CSV mínimo:
  - sesión
  - alumno
  - estado final
  - hora de entrada
  - último heartbeat
  - reingresos
  - cantidad de capturas
  - eventos principales
- JSON completo:
  - misma estructura que endpoint de auditoría
- PDF queda fuera de esta fase para evitar dependencia pesada; se puede agregar después.

## Cambios de interfaces

- `sessions`:
  - agregar `screenshotIntervalMs`
- `events`:
  - usar tipos nuevos: `reconnected`, `stream-error`, `browser-closed`, `message`, `screenshot-config-updated`
- REST:
  - agregar endpoint para actualizar configuración de captura de sesión
  - opcional: endpoint liviano para eventos por alumno
- Socket.IO:
  - agregar `server:screenshot-config`
  - emitir estados de alerta ya derivados o eventos suficientes para derivarlos en frontend

## Test plan

- Crear sesión con plantilla local y verificar que aplica duración, red y captura automática.
- Cambiar whitelist/toggles durante examen y confirmar que solo activos llegan al agente.
- Simular alumno offline y verificar que aparece en `Alertas`.
- Simular captura fallida y verificar badge, evento y auditoría.
- Cambiar intervalo de captura durante sesión y verificar que el agente actualiza timer sin reiniciar examen.
- Enviar mensaje rápido y verificar recepción en alumno y registro en auditoría.
- Exportar auditoría CSV/JSON y validar contenido básico.
- Probar sesión legacy sin `screenshotIntervalMs` y confirmar fallback seguro.

## Supuestos

- Se implementan primero funciones del docente, no cambios de roles administrativos.
- Plantillas personales se guardan localmente, no en Firestore.
- La captura automática por sesión requiere actualizar agente/ISO.
- Exportación PDF se deja para una fase posterior.
