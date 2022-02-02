const Generator = require('yeoman-generator')
const updateNotifier = require('update-notifier')
const chalk = require('chalk')
const boxen = require('boxen')
const beeper = require('beeper')
const fs = require('fs-extra')
const path = require('path')
const ora = require('ora')
const download = require('download-git-repo')

const {
  APP_TYPE,
  BOXEN_OPTS,
  DEFAULT_DIR,
  GIT_BASE,
  WEBPACK_BASE,
  ROLLUP_BASE,
  ORA_SPINNER,
} = require('./constant')

const pkg = require('./package')

class WebRollGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts)

    this.type = APP_TYPE.WEBPACK

    this._getDefaultDir = this._getDefaultDir.bind(this)
    this._checkVersion = this._checkVersion.bind(this)
    this._printEnvInfo = this._printEnvInfo.bind(this)
    this._askForAppType = this._askForAppType.bind(this)
    this._askForDir = this._askForDir.bind(this)
    this._askForOverwrite = this._askForOverwrite.bind(this)
    this._walk = this._walk.bind(this)
    this._downloadTemplate = this._downloadTemplate.bind(this)
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

  /** ------------------ prompting options for CLI users --------------------- */

  async _askForAppType() {
    const questions = [
      {
        type: 'list',
        name: 'type',
        choices: [
          {
            name: 'webpack (app based on webpack, webpack-cli)',
            value: APP_TYPE.WEBPACK,
          },
          {
            name: 'webpack (app based on rollup, rollup-cli)',
            value: APP_TYPE.ROLLUP,
          },
        ],
        messages: 'Please choose the build tool for your project：',
        default: APP_TYPE.WEBPACK,
      },
    ]

    const { type } = await this.prompt(questions)
    this.type = type
    this.dirName = this._getDefaultDir()
  }

  async _askForDir() {
    const questions = [
      {
        type: 'input',
        name: 'dirName',
        message: 'Please enter the directory name for your project：',
        default: this.dirName,
        validate: (dirName) => {
          if (dirName.length < 1) {
            beeper()
            return '⚠️  directory name must not be null！'
          }
          return true
        },
      },
    ]

    const { dirName } = await this.prompt(questions)
    this.dirName = dirName
  }

  async _askForOverwrite() {
    const destination = this.destinationPath()
    const dirName = this.dirName
    if (!fs.existsSync(path.resolve(destination, dirName))) {
      return Promise.resolve()
    }

    const warn = chalk.grey('CAUTION: Files may be overwritten!')
    const question = [
      {
        type: 'confirm',
        name: 'overwrite',
        message: `⚠️  Directory ${dirName} exists. Do you want to continue using it? ${warn}`,
        default: false,
      },
    ]

    const { overwrite } = await this.prompt(question)
    if (!overwrite) {
      this.dirName = DEFAULT_DIR
    }
  }

  /** ------------------ constructing CLI project --------------------- */

  /**
   *
   * @param {string} filePath: [from]
   * @param {string} templateRoot: [to]
   * @description copy all content from [from] directory to [to] directory iteratedly
   * @returns
   */

  _walk(filePath, templateRoot) {
    if (fs.statSync(filePath).isDirectory()) {
      fs.readdirSync(filePath).forEach((name) => {
        this._walk(path.resolve(filePath, name), templateRoot)
      })
      return
    }

    const relativePath = path.relative(templateRoot, filePath)
    const destination = this.destinationPath(this.dirName, relativePath)
    this.fs.copyTpl(filePath, destination, {
      dirName: this.dirName,
    })
  }

  _downloadTemplate(repository) {
    return new Promise((resolve, reject) => {
      const dirPath = this.destinationPath(this.dirName, '.tmp')
      download(repository, dirPath, (err) => (err ? reject(err) : resolve()))
    })
  }

  /**
   * @description Infuse template files and directories
   */
  writing() {
    const repository =
      this.type === APP_TYPE.WEBPACK ? WEBPACK_BASE : ROLLUP_BASE

    this.log('⚙  Finish basic configuration.', chalk.green('✔'))
    this.log()
    this.log('📂 Generate project template and configuration...')

    let spinner = ora({
      text: `Download template from ${GIT_BASE}${repository}...`,
      spinner: ORA_SPINNER,
    }).start()

    this._downloadTemplate(repository)
      .then(() => {
        spinner.stopAndPersist({
          symbol: chalk.green('   ✔'),
          text: `Finish downloading template from ${GIT_BASE}${repository}`,
        })

        spinner = ora({
          text: 'Copy files into project folder.',
          spinner: ORA_SPINNER,
        }).start()

        const templateRoot = this.destinationPath(this.dirName, '.tmp')
        this._walk(templateRoot)
        spinner.stopAndPersist({
          symbol: chalk.green('   ✔'),
          text: 'Finish copying files into project folder',
        })

        spinner = ora({
          text: 'Clean tmp files and folders...',
          spinner: ORA_SPINNER,
        }).start()
        fs.removeSync(templateRoot)
        spinner.stopAndPersist({
          symbol: chalk.green('   ✔'),
          text: 'Finish cleaning tmp files and folders',
        })
      })
      .catch((err) => {
        this.env.error(err)
      })
  }

  /**
   * @description install npm dependencies
   */
  install() {
    this.log()
    this.log(
      '📂 Finish generating the project template and configuration.',
      chalk.green('✔')
    )
    this.log()
    this.log('📦 Install dependencies...')

    this.npmInstall(
      '',
      {},
      {
        cwd: this.destinationPath(this.dirName),
      }
    )
  }

  end() {
    const dir = chalk.green(this.dirName)
    const info = `🎊 Create project successfully! Now you can enter ${dir} and start to code.`
    this.log('📦 Finish installing dependencies.', chalk.green('✔'))
    this.log()
    this.log(
      boxen(info, {
        ...BOXEN_OPTS,
        ...{
          borderColor: 'white',
        },
      })
    )
  }
}

module.exports = WebRollGenerator
