const APP_TYPE = {
  WEBPACK: 'webpack',
  ROLLUP: 'rollup',
}

const BOXEN_OPTS = {
  padding: 1,
  margin: 1,
  align: 'center',
  borderColor: 'yellow',
  borderStyle: 'round',
}

const DEFAULT_DIR = 'webpack-app'
const GIT_BASE = 'https://github.com/cclintris/'
const WEBPACK_BASE = 'create-WebRoll-app-template'
const ROLLUP_BASE = ''

const ORA_SPINNER = {
  interval: 80,
  frames: [
    '   ⠋',
    '   ⠙',
    '   ⠚',
    '   ⠞',
    '   ⠖',
    '   ⠦',
    '   ⠴',
    '   ⠲',
    '   ⠳',
    '   ⠓',
  ],
}

module.exports = {
  APP_TYPE,
  BOXEN_OPTS,
  DEFAULT_DIR,
  GIT_BASE,
  WEBPACK_BASE,
  ROLLUP_BASE,
  ORA_SPINNER,
}
