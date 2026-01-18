import { VNode } from 'vue'

export type Menu = {
  label: string
  path: string
  isDirectory?: boolean
  children?: Menu[]
  icon?: () => VNode
}

type MenuDefinition = Optional<Menu, 'path'>

type MenuDefinitionGetter = () => MenuDefinition

const menuModules = import.meta.glob('@/menu/menus/**/*.ts', {
  import: 'default',
  eager: true,
})

export function getMenus() {
  const allMenus = Object.entries(menuModules).map(([path, module]) => {
    const menuDefinitionGetter = module as MenuDefinitionGetter
    const menuDefinition = menuDefinitionGetter()
    const getMenuPath = () => {
      let menuPath = path
      // 去掉开头的路径和结尾文件名
      menuPath = menuPath.replace(/^\/src\/menu\/menus/, '').replace(/\.ts$/, '')
      // 去除排序数字
      menuPath = menuPath.replace(/(\/\d+\.)/g, '/')
      // 去除 'index'
      menuPath = menuPath.replace(/index/g, '').replace(/\/+/g, '/')
      // 处理末尾的 '/'
      menuPath = menuPath.replace(/^(.+)\/$/, '$1')
      return menuPath
    }

    const menu: Menu = {
      ...menuDefinition,
      path: menuDefinition.path || getMenuPath(),
    }
    return menu
  })
  const menuByPath = new Map(allMenus.map((menu) => [menu.path, menu]))
  const childMenuByPath = new Map<Menu['path'], Menu>()
  allMenus.forEach((menu) => {
    const parentPath = getParentPath(menu.path)
    const parentMenu = menuByPath.get(parentPath)
    if (!parentMenu) return
    const children = parentMenu.children || []
    children.push(menu)
    parentMenu.children = children
    childMenuByPath.set(menu.path, menu)
  })
  const menus = allMenus.filter((menu) => !childMenuByPath.has(menu.path))
  return menus
}

export function defineMenu(menuDefinition: MenuDefinition | MenuDefinitionGetter) {
  if (typeof menuDefinition !== 'function') {
    return () => menuDefinition
  }
  return menuDefinition
}

function getParentPath(path: string) {
  const parentPath = path.substring(0, path.lastIndexOf('/'))
  return parentPath
}
