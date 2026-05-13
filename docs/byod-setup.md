# ExamLock — Guía BYOD para alumnos

## Lo que necesitas

- PC personal con Windows, Mac, o Linux
- VirtualBox ≥ 7.0 (gratuito)
- Archivo `examlock.ova` que te dará el docente

---

## Paso 1 — Instalar VirtualBox

Descarga e instala VirtualBox desde virtualbox.org. Solo necesitas instalarlo una vez.

---

## Paso 2 — Importar la VM (una sola vez)

1. Abre VirtualBox
2. Menú **Archivo → Importar servicio virtualizado…**
3. Selecciona `examlock.ova`
4. Deja todo por defecto → **Importar**
5. Espera 2-3 minutos

La VM aparece en la lista como **ExamLock**.

---

## Paso 3 — El día del examen

1. Abre VirtualBox
2. Selecciona **ExamLock** → botón **Iniciar**
3. La VM arranca sola (sin contraseña, sin escritorio)
4. Aparece una pantalla pidiendo el **código de sesión**
5. Ingresa el código que te dio tu docente (ej: `CALC-B7X2`)
6. Presiona **Continuar** → el examen carga

> Para que la pantalla ocupe todo el monitor: **Ver → Modo pantalla completa** (o `Host+F` en VirtualBox).

---

## Durante el examen

- Responde directamente en la pantalla del examen
- Tus respuestas se guardan automáticamente
- Si tu internet se cae, las respuestas quedan guardadas localmente y se sincronizan al reconectarse
- El docente puede enviarte mensajes que aparecen en pantalla

---

## Al terminar

El docente enviará la señal de fin. La pantalla mostrará **"Examen finalizado"**.

1. Cierra la VM normalmente: menú **Máquina → Apagar**
2. No necesitas hacer nada más — las respuestas ya están guardadas en el servidor

---

## Preguntas frecuentes

**¿Mis archivos personales están seguros?**
Sí. La VM es un entorno separado. No puede acceder a tus archivos del host.

**¿Qué pasa si cierro VirtualBox accidentalmente?**
El docente verá la alerta y puede reactivar tu sesión con un token.

**¿Necesito internet en la VM?**
Sí, para conectarse al servidor del examen. Solo ese tráfico está permitido.

**¿Puedo usar el host mientras corre la VM?**
Técnicamente sí, pero la cámara está activa y el docente puede ver si apartas la mirada de la pantalla.
