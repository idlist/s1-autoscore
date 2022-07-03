import { EventEmitter } from 'node:events'
import axios from 'axios'
import CookiesPool from './cookies-pool'
import t from './times'
import log from './log'

interface AutoScorerOptions {
  username: string
  password: string
  interval?: number
  restartThreshold?: number
}

class AutoScorer {
  username: string
  password: string
  interval: number
  restartThreshold: number
  restartToggler: EventEmitter

  loginTime: number
  cookies: CookiesPool

  constructor(options: AutoScorerOptions) {
    this.username = options.username
    this.password = options.password
    this.interval = options.interval ?? t.minute * 5
    this.restartThreshold = options.restartThreshold ?? t.hour * 12
    this.cookies = new CookiesPool()
    this.restartToggler = new EventEmitter()

    this.loginTime = 0
    this.restartToggler.on('restart', async () => { await this.start() })
  }

  get loginData(): string {
    return `username=${encodeURI(this.username)}&password=${this.password}`
  }

  async login(): Promise<void> {
    // https://github.com/ykrank/S1-Next/blob/master/app/src/main/java/me/ykrank/s1next/data/api/ApiMember.java
    const login = await axios({
      method: 'post',
      url: 'https://bbs.saraba1st.com/2b/api/mobile/index.php',
      params: {
        module: 'login',
        loginsubmit: 'yes',
        loginfield: 'auto',
        cookietime: 259200,
      },
      data: this.loginData,
    })

    this.loginTime = Date.now()
    this.cookies.prefix = login.data.Variables.cookiepre
    this.cookies.reset().update(login.headers['set-cookie'])
    log(`Login: ${this.username}`)
  }

  async refresh(): Promise<boolean> {
    const refresh = await axios({
      method: 'get',
      url: 'https://bbs.saraba1st.com/2b/forum.php',
      headers: {
        cookie: this.cookies.serialize(),
      },
    })
    const data = refresh.data as string

    if (!data.match(this.username)) {
      log(`Refresh failed: ${this.username}`)
      return false
    }
    else {
      this.cookies.update(refresh.headers['set-cookie'])
      log(`Refresh success: ${this.username}`)
      return true
    }
  }

  async start(): Promise<void> {
    await this.login()

    const refreshHandler = setInterval(async () => {
      const refreshSucceed = await this.refresh()

      const timePassed = Date.now() - this.loginTime
      const forceRestart = timePassed > this.restartThreshold

      if (!refreshSucceed || forceRestart) {
        if (!refreshSucceed) {
          log(`Restart login: ${this.username}; Reason: refresh failed`)
        }
        if (forceRestart) {
          log(`Restart login: ${this.username}; Reason: force restart`)
        }

        clearInterval(refreshHandler)
        this.restartToggler.emit('restart')
      }
    }, this.interval)
  }
}

export default AutoScorer