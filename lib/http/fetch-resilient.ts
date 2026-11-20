const RETRY_STATUS = new Set([408, 502, 503, 504])
const DEFAULT_TIMEOUT_MS = 120_000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface FetchResilientOptions {
  /** Extra attempts after the first request (default 2 → up to 3 tries). */
  retries?: number
  timeoutMs?: number
}

/**
 * Client fetch tuned for cold starts (e.g. Render free tier): long timeout + retries on gateway errors.
 */
export async function fetchResilient(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: FetchResilientOptions,
): Promise<Response> {
  const retries = options?.retries ?? 2
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(input, {
        ...init,
        signal: init?.signal ?? controller.signal,
      })
      clearTimeout(timer)
      if (RETRY_STATUS.has(response.status) && attempt < retries) {
        await sleep(1200 * (attempt + 1))
        continue
      }
      return response
    } catch (error) {
      clearTimeout(timer)
      lastError = error
      if (attempt < retries) {
        await sleep(1200 * (attempt + 1))
        continue
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Request failed.")
}