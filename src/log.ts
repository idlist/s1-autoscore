import dayjs from 'dayjs'

const log = (...args: unknown[]): void => {
  const time = dayjs().format('MM/DD HH:mm:ss')

  console.log(`[${time}]`, ...args)
}

export default log