const path = require('path')
const toml = require('@iarna/toml')
const fs = require('node:fs')
const { PROJECT_DIR } = require('./commons/vars.cjs')

const newVersion = getNewVersion()
updateVersionForPackageJson(newVersion)
updateVersionForTauriConfJson(newVersion)
updateVersionForCargoToml(newVersion)

function getNewVersion() {
  const now = new Date()
  const year = now.getFullYear().toString().substring(2, 4)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hour = now.getHours().toString().padStart(2, '0')
  const minute = now.getMinutes().toString().padStart(2, '0')
  const second = now.getSeconds().toString().padStart(2, '0')
  const version = `0.${year}${month}${day}.${hour}${minute}${second}`
  return version
}

function updateVersionForPackageJson(version) {
  const filePath = path.join(PROJECT_DIR, 'package.json')
  const obj = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  obj.version = version
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2))
}

function updateVersionForTauriConfJson(version) {
  const filePath = path.join(PROJECT_DIR, 'src-tauri/tauri.conf.json')
  const obj = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  obj.version = version
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2))
}

function updateVersionForCargoToml(version) {
  const filePath = path.join(PROJECT_DIR, 'src-tauri/cargo.toml')
  const obj = toml.parse(fs.readFileSync(filePath, 'utf8'))
  obj.package.version = version
  fs.writeFileSync(filePath, toml.stringify(obj))
}
