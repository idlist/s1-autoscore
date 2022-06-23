import { readFile } from 'fs/promises'
import yaml from 'js-yaml'

interface User {
  username: string
  password: string
}

interface Config {
  interval?: number
  restartThreshold?: number
  accounts: User[]
}

const loadConfig = async (): Promise<Config> => {
  const rawConfig = await readFile('config.yaml', 'utf-8')
  const parsedConfig = yaml.load(rawConfig) as Config

  if (parsedConfig.interval) parsedConfig.interval *= 1000
  if (parsedConfig.restartThreshold) parsedConfig.restartThreshold *= 1000

  return parsedConfig
}

export default loadConfig