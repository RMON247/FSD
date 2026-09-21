import { validationResult } from 'express-validator'

export function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => `${e.path || e.param}: ${e.msg}`).join('; ')
    return res.status(400).json({ message: `Validation failed: ${details}`, errors: errors.array() })
  }
  next()
}

