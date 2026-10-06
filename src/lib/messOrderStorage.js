export const DEMO_MESS_ORDERS_KEY = 'campusplus_demo_mess_orders'

export function getDemoMessOrders() {
  try {
    const orders = JSON.parse(localStorage.getItem(DEMO_MESS_ORDERS_KEY) || '[]')
    return Array.isArray(orders) ? orders : []
  } catch {
    return []
  }
}

export function saveDemoMessOrders(orders) {
  localStorage.setItem(DEMO_MESS_ORDERS_KEY, JSON.stringify(orders))
}

export function makeLocalDateValue(date = new Date()) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}
