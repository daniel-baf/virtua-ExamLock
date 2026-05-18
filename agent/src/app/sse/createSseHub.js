function createSseHub() {
  const clients = new Set();

  function attach(_req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (name, data) => {
      res.write(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    clients.add(send);
    send('connected', {});
    _req.on('close', () => clients.delete(send));
  }

  function broadcast(name, data) {
    clients.forEach(send => send(name, data));
  }

  return { attach, broadcast };
}

module.exports = { createSseHub };
