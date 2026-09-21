import Transaction from '../models/Transaction.js'

export async function listTransactions(req, res, next) {
  try {
    const { type, storageId, limit } = req.query
    const query = {}
    if (type && type !== 'All') query.type = type
    if (storageId && storageId !== 'All') query.storageId = storageId

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(limit ? Number(limit) : 200)

    res.json({ count: transactions.length, transactions })
  } catch (err) {
    next(err)
  }
}
