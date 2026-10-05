export type CloudPaymentMethod = 'crypto' | 'card'
export type CloudCheckoutRequest = (payload: Record<string, unknown>, signal?: AbortSignal) => Promise<Record<string, unknown>>

export function cloudCheckoutUrl(result: Record<string, unknown>, method: CloudPaymentMethod): string {
  if (result.ok === false) throw new Error(String(result.error || 'CHECKOUT_FAILED'))
  const raw = method === 'crypto' ? result.invoice_url : result.redirect_url
  if (typeof raw !== 'string' || !raw.trim()) throw new Error('CHECKOUT_LINK_MISSING')
  let url: URL
  try { url = new URL(raw) } catch { throw new Error('CHECKOUT_LINK_MISSING') }
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('CHECKOUT_LINK_MISSING')
  return url.href
}

export async function requestCloudCheckout(request: CloudCheckoutRequest, method: CloudPaymentMethod, timeoutMs = 30000): Promise<string> {
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error('CHECKOUT_TIMEOUT'))
        controller.abort()
      }, timeoutMs)
    })
    const result = await Promise.race([
      request({ action: method === 'crypto' ? 'checkout_crypto' : 'checkout_whop' }, controller.signal),
      timeout,
    ])
    return cloudCheckoutUrl(result, method)
  } finally {
    clearTimeout(timer)
  }
}
