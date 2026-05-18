function getAllowedOrigins(rawOrigins = process.env.CORS_ORIGINS ?? '*') {
  return rawOrigins.split(',').map(origin => origin.trim());
}

module.exports = { getAllowedOrigins };
