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

  /**
   * print environment information(Node env)
   * @return void
   */
  _printEnvInfo() {
    const { env, version, platform, cwd } = process
    this.log(chalk.grey('Environment Information:'))
    this.log(chalk.grey(`Node env\t${env}`))
    this.log(chalk.grey(`Node version\t${version}`))
    this.log(chalk.grey(`OS\t${platform}`))
    this.log(chalk.grey(`Program running directory\t${cwd()}`))
  }

  initialize() {
    this.log()

    const version = `v${pkg.version}`
    const messages = []
    messages.push(
      `💁 Welcome to Generator-Create-WebRoll CLI ${chalk.grey(version)}~  `
    )
    messages.push(
      chalk.yellow(
        'You can create a Webpack/Rollup-based frontend environment app.'
      )
    )
    messages.push(
      chalk.grey('https://github.com/cclintris/generator-create-WebRoll-app')
    )
    // npm package url
    // messages.push()
    this.log(
      boxen(messages.join('\n'), {
        ...BOXEN_OPTS,
        borderColor: 'green',
        borderStyle: 'doubleSingle',
      })
    )

    this._printEnvInfo()
    this._checkVersion()
  }
}

module.exports = WebRollGenerator
