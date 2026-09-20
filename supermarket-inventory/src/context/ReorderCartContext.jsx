import { createContext, useContext, useMemo, useReducer } from 'react'

const ReorderCartContext = createContext(null)

const initialState = { items: [] }

function reorderReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const exists = state.items.find((i) => i.id === action.payload.id)
      if (exists) return state
      return { items: [...state.items, { ...action.payload, quantity: action.payload.suggested || 10 }] }
    }
    case 'REMOVE':
      return { items: state.items.filter((i) => i.id !== action.payload.id) }
    case 'SET_QUANTITY':
      return {
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, quantity: Math.max(1, action.payload.quantity) } : i
        )
      }
    case 'CLEAR':
      return initialState
    default:
      return state
  }
}

export function ReorderCartProvider({ children }) {
  const [state, dispatch] = useReducer(reorderReducer, initialState)

  const value = useMemo(() => ({
    items: state.items,
    count: state.items.length,
    addItem: (product) => dispatch({ type: 'ADD', payload: product }),
    removeItem: (id) => dispatch({ type: 'REMOVE', payload: { id } }),
    setQuantity: (id, quantity) => dispatch({ type: 'SET_QUANTITY', payload: { id, quantity } }),
    clear: () => dispatch({ type: 'CLEAR' })
  }), [state.items])

  return <ReorderCartContext.Provider value={value}>{children}</ReorderCartContext.Provider>
}

export function useReorderCart() {
  const ctx = useContext(ReorderCartContext)
  if (!ctx) throw new Error('useReorderCart must be used within ReorderCartProvider')
  return ctx
}
