import Transaction from '../models/Transaction.js'

export async function listTransactions(req, res, next) {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 })
    res.json({ count: transactions.length, transactions })
  } catch (err) {
    next(err)
  }
}

export async function createTransaction(req, res, next) {
  try {
    const transaction = await Transaction.create(req.body)
    req.app.locals.broadcast?.({ type: 'transaction:created', payload: transaction })
    res.status(201).json({ transaction })
  } catch (err) {
    next(err)
  }
}
