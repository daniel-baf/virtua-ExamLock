// students.js — 25 alumnos en 3 anillos radiales

const NAMES = [
    'Valentina García', 'Rodrigo López', 'Andrea Pérez', 'Carlos Mendoza', 'Pedro González',
    'Sofía Ramírez', 'Diego Torres', 'María Castillo', 'Alejandro Jiménez', 'Camila Flores',
    'Fernando Morales', 'Daniela Reyes', 'Miguel Herrera', 'Lucía Vásquez', 'Sebastián Castro',
    'Isabella Ortega', 'Joaquín Ruiz', 'Valeria Muñoz', 'Emiliano Díaz', 'Natalia Vargas',
    'Ximena Ríos', 'Adrián Salazar', 'Paola Figueroa', 'René Maldonado', 'Gloria Chávez'
];

// Ring distribution: ring 1=6, ring 2=10, ring 3=9
const RINGS = [
    { count: 6,  radiusFactor: 0.26 },
    { count: 10, radiusFactor: 0.40 },
    { count: 9,  radiusFactor: 0.53 }
];

export function createStudents() {
    const students = [];
    let idx = 0;
    let ringIdx = 0;
    let posInRing = 0;

    RINGS.forEach(ring => {
        const offset = ringIdx * 17; // stagger ring start angles
        for (let i = 0; i < ring.count; i++) {
            const angleDeg = (360 / ring.count) * i + offset;
            const angleRad = (angleDeg * Math.PI) / 180;
            students.push({
                id: idx + 1,
                name: NAMES[idx],
                ip: `192.168.${ringIdx + 1}.${100 + i + 1}`,
                state: 'offline',
                shield: false,
                uploadCount: 0,
                ring: ringIdx,
                radiusFactor: ring.radiusFactor,
                angleDeg,
                angleRad,
                connectedAt: null
            });
            idx++;
        }
        ringIdx++;
    });

    return students;
}

export function getStudentById(students, id) {
    return students.find(s => s.id === id);
}

// Pedro is student id=5 (0-indexed 4) for expulsion scenario
export const PEDRO_ID    = 5;
export const VALENTINA_ID = 1;
export const RODRIGO_ID   = 2;
export const ANDREA_ID    = 3;
export const CARLOS_ID    = 4;
