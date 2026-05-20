// milestones.js — timeline declarativo de eventos

export const START_TIME = new Date(2026, 4, 20, 8, 0, 0);
export const END_TIME   = new Date(2026, 4, 20, 10, 0, 0);

export const milestones = [
    {
        id: 0,
        time: '08:00', title: 'Docente inicia sesión',
        desc: 'Cloud Run instanciado. WebSocket Server activo en puerto 443.',
        triggerTime: new Date(2026, 4, 20, 8, 0, 0),
        color: '#8b5cf6', pause: false
    },
    {
        id: 1,
        time: '08:01', title: 'Apertura de admisión',
        desc: 'Servidor abre endpoint /join. Alumnos pueden comenzar handshake JWT.',
        triggerTime: new Date(2026, 4, 20, 8, 1, 0),
        color: '#06b6d4', pause: false
    },
    {
        id: 2,
        time: '08:01', title: 'Oleada de conexiones (25 alumnos)',
        desc: '25 daemons locales conectan escalonadamente. Cada uno autentica con Firebase, obtiene JWT, Firestore escribe estado, iptables activa.',
        triggerTime: new Date(2026, 4, 20, 8, 1, 30),
        color: '#10b981', pause: true
    },
    {
        id: 3,
        time: '08:15', title: 'Examen inicia',
        desc: 'Señal session:started. WSS persistente activa. Telemetría a GCS fluye.',
        triggerTime: new Date(2026, 4, 20, 8, 15, 0),
        color: '#10b981', pause: false
    },
    {
        id: 4,
        time: '08:35', title: 'Evasión DNS — Valentina',
        desc: 'Detección de modificación /etc/resolv.conf. Daemon autocura reglas iptables.',
        triggerTime: new Date(2026, 4, 20, 8, 35, 0),
        color: '#f59e0b', pause: false
    },
    {
        id: 5,
        time: '08:50', title: 'Corte Wi-Fi — Rodrigo',
        desc: 'Canal WSS caído. Daemon entra en modo contingencia offline. Capturas a /tmp local.',
        triggerTime: new Date(2026, 4, 20, 8, 50, 0),
        color: '#f59e0b', pause: false
    },
    {
        id: 6,
        time: '09:05', title: 'Reconexión — Rodrigo',
        desc: 'Red restaurada. Burst upload de evidencias almacenadas a GCS.',
        triggerTime: new Date(2026, 4, 20, 9, 5, 0),
        color: '#10b981', pause: false
    },
    {
        id: 7,
        time: '09:20', title: 'Cámara tapada — Andrea',
        desc: 'Dashboard detecta frames negros de webcam. Alerta visual al docente.',
        triggerTime: new Date(2026, 4, 20, 9, 20, 0),
        color: '#f59e0b', pause: false
    },
    {
        id: 8,
        time: '09:30', title: 'USB + Expulsión — Pedro',
        desc: 'USB montado detectado por udev. Docente expulsa. Lockscreen activado. iptables -A OUTPUT -j DROP total.',
        triggerTime: new Date(2026, 4, 20, 9, 30, 0),
        color: '#ef4444', pause: true
    },
    {
        id: 9,
        time: '09:45', title: 'Alerta Keylogger IA — Carlos',
        desc: 'Paste masivo de 1200 chars detectado. Ritmo de escritura sobrehumano. Alerta IA en dashboard.',
        triggerTime: new Date(2026, 4, 20, 9, 45, 0),
        color: '#f59e0b', pause: false
    },
    {
        id: 10,
        time: '10:00', title: 'Cierre y liberación',
        desc: 'session:finished emitido. loginctl terminate-user. iptables -F. RAM limpiada.',
        triggerTime: new Date(2026, 4, 20, 10, 0, 0),
        color: '#8b5cf6', pause: false
    }
];
