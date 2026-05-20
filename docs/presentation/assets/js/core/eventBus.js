// eventBus.js — pub/sub simple compartido entre módulos

const handlers = {};

export const bus = {
    on(event, fn) {
        (handlers[event] = handlers[event] || []).push(fn);
    },
    off(event, fn) {
        handlers[event] = (handlers[event] || []).filter(h => h !== fn);
    },
    emit(event, data) {
        (handlers[event] || []).forEach(fn => fn(data));
    }
};
