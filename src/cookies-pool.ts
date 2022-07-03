class CookiesPool {
  prefix: string
  cookies: Record<string, string>

  constructor(prefix?: string) {
    this.prefix = prefix ?? ''
    this.cookies = {}
  }

  reset() {
    this.cookies = {}

    return this
  }

  update(rawCookies: string[] = []) {
    rawCookies.forEach((cookie) => {
      const item = cookie.split(';')[0]
      const [key, value] = item.split('=')
      const parsedKey = key.replace(new RegExp(`^${this.prefix}`), '')
      this.cookies[parsedKey] = value
    })

    return this
  }

  serialize() {
    return Object.entries(this.cookies).map(([key, value]) => {
      return `${this.prefix}${key}=${value}`
    }).join('; ')
  }
}

export default CookiesPool