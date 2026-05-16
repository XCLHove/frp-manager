const child_process = require('child_process')
const { PROJECT_DIR } = require('./commons/vars.cjs')

child_process.execSync('npm run tauri dev', {
  stdio: 'inherit',
  cwd: PROJECT_DIR,
  env: process.env,
})
