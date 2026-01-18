import { type AliasOptions } from 'vite'
import { join } from 'path'

const baseDir = join(__dirname, '../../')
export const alias: AliasOptions = {
  '@': join(baseDir, 'src'),
}
