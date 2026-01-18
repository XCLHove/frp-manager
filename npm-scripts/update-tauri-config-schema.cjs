const path = require('path')
const fs = require('fs')
const vars = require('./commons/vars.cjs')

fetch('https://schema.tauri.app/config/2')
  .then((response) => response.text())
  .then((text) => JSON.parse(text))
  .then((object) => JSON.stringify(object, null, 4))
  .then((jsonStr) => {
    const filePath = path.join(vars.PROJECT_DIR, '/src-tauri/tauri.conf.schema.json')
    fs.writeFileSync(filePath, jsonStr)
    console.log('success')
  })
  .catch((error) => console.error(error))
