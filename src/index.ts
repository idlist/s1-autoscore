import AutoScorer from './autoscorer'
import loadConfig from './load-config'

const main = async () => {
  const config = await loadConfig()

  config.accounts.forEach((account) => {
    new AutoScorer({
      username: account.username,
      password: account.password,
      interval: config.interval,
      restartThreshold: config.restartThreshold,
    }).start()
  })
}

main()