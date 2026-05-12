export async function api(path, method = 'GET', body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) opts.body = JSON.stringify(body)
  const r = await fetch(path, opts)
  const d = await r.json()
  if (!r.ok) throw new Error(d.error || 'Request failed')
  return d
}

export function fmt(dt) {
  return dt ? new Date(dt).toLocaleString('en-IN') : '—'
}

export const ICONS = {
  'Two-Wheeler': 'bike',
  'Four-Wheeler': 'car-front',
  'Heavy Vehicle': 'truck',
}

export const RATES = {
  'Two-Wheeler': 20,
  'Four-Wheeler': 50,
  'Heavy Vehicle': 100,
}
