const child_process = require('child_process')
const { PROJECT_DIR } = require('./commons/vars.cjs')
const fs = require('fs')
const path = require('path')

fs.rmSync(path.resolve(PROJECT_DIR, 'src-tauri/target/debug/resources/frp-doc'), { recursive: true, force: true })

child_process.execSync('npm run tauri dev', {
  stdio: 'inherit',
  cwd: PROJECT_DIR,
  env: process.env,
})
