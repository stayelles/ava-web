// Bound both response headers and body. No automatic replay: an OTP request
// may already have sent an email when its response is lost.
export class AuthRequestTimeout extends Error {
  constructor() { super('AUTH_REQUEST_TIMEOUT'); this.name = 'AuthRequestTimeout' }
}
export class AuthResponseError extends Error {
  readonly status: number
  constructor(status: number, code: string) { super(code); this.status = status }
}
export function isRejectedAuthSession(error: unknown) {
  return error instanceof AuthResponseError && (error.status === 401 || error.status === 403)
}
export async function fetchAuthResponse(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 20_000,
): Promise<Response> {
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new AuthRequestTimeout())
      controller.abort()
    }, timeoutMs)
  })
  const request = (async () => {
    const inherited = init.signal ?? (input instanceof Request ? input.signal : undefined)
    const signal = inherited ? AbortSignal.any([inherited, controller.signal]) : controller.signal
    const response = await fetch(input, { ...init, signal })
    const body = await response.arrayBuffer()
    return new Response([204, 205, 304].includes(response.status) ? null : body, {
      status: response.status, statusText: response.statusText, headers: response.headers,
    })
  })()
  try { return await Promise.race([request, timeout]) }
  finally { clearTimeout(timer) }
}
