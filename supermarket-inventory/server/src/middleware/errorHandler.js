export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error('[error]', err)

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation failed', details: err.message })
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    return res.status(409).json({ message: `A record with this ${field} already exists.` })
  }

  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
}
