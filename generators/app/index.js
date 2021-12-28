const Generator = require('yeoman-generator')
const updateNotifier = require('update-notifier')
const chalk = require('chalk')
const boxen = require('boxen')
const beeper = require('beeper')

const { APP_TYPE, BOXEN_OPTS } = require('./constant')
const pkg = require('./package')

class WebRollGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts)

    this.type = APP_TYPE.WEBPACK

    this._getDefaultDir = this._getDefaultDir.bind(this)
  }

  _getDefaultDir() {
    return `${this.type}-app`
  }

  /**
   * check version of Generator-Create-WebRoll CLI dependencies
   * @return boolean
   */
  _checkVersion() {
    this.log()
    this.log('🛠️  Checking your Generator-Create-WebRoll CLI version...')

    let checkResult = false

    const notifier = updateNotifier({
      pkg,
      updateCheckInterval: 0,
    })

    const update = notifier.update
    if (update) {
      const messages = []
      const { current, latest } = update
      messages.push(
        chalk.bgYellow.black(' WARNING: ') +
          '  Generator-Create-WebRoll is not latest.\n'
      )
      messages.push(
        chalk.grey('current: ') +
          chalk.grey(current) +
          chalk.grey(' → ') +
          chalk.grey('latest: ') +
          chalk.green(latest)
      )
      messages.push(chalk.grey('Up to date ') + `npm i -g ${pkg.name}`)
      this.log(boxen(messages.join('\n'), BOXEN_OPTS))
      beeper()
      this.log(
        '🛠️  Finish checking your Generator-Create-WebRoll CLI. CAUTION ↑↑',
        '⚠️'
      )
    } else {
      checkResult = true
      this.log(
        '🛠️  Done checking your Generator-Create-WebRoll CLI. Good to go!',
        chalk.green('✔')
      )
    }

    return checkResult
  }
}

module.exports = WebRollGenerator
