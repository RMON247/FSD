import Storage from '../models/Storage.js'

export async function listStorage(req, res, next) {
  try {
    const locations = await Storage.find().sort({ createdAt: -1 })
    res.json({ count: locations.length, storageLocations: locations })
  } catch (err) {
    next(err)
  }
}

export async function createStorage(req, res, next) {
  try {
    const storage = await Storage.create(req.body)
    req.app.locals.broadcast?.({ type: 'storage:created', payload: storage })
    res.status(201).json({ storage })
  } catch (err) {
    next(err)
  }
}

export async function updateStorage(req, res, next) {
  try {
    const storage = await Storage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    if (!storage) return res.status(404).json({ message: 'Storage location not found.' })
    req.app.locals.broadcast?.({ type: 'storage:updated', payload: storage })
    res.json({ storage })
  } catch (err) {
    next(err)
  }
}

export async function deleteStorage(req, res, next) {
  try {
    const storage = await Storage.findByIdAndDelete(req.params.id)
    if (!storage) return res.status(404).json({ message: 'Storage location not found.' })
    req.app.locals.broadcast?.({ type: 'storage:deleted', payload: { id: storage._id } })
    res.json({ message: 'Storage location deleted.' })
  } catch (err) {
    next(err)
  }
}
