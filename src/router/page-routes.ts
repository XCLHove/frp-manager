import { type RouteRecordRaw } from 'vue-router'

const pageModules = import.meta.glob('../pages/**/index.vue', {
  import: 'default',
})
const routes: RouteRecordRaw[] = Object.entries(pageModules).map(([path, asyncComponentGetter]) => {
  // 去掉开头的路径和结尾文件名
  path = path.replace(/\.\.\/pages/, '').replace(/\.vue$/, '')
  // 去掉 'index'
  path = path.replace(/index/g, '').replace(/\/+/g, '/')
  // 处理连续的'/'
  path = path.replace(/\/{2,}/, '/')
  // 处理末尾的 '/'
  path = path.replace(/^(.+)\/$/, '$1')
  // 处理动态路由：/user/[id] => /user/:id
  path = path.replace(/\[([^\[]+)\]/g, ':$1')

  return {
    path: path,
    component: asyncComponentGetter,
    children: [],
  }
})

// 处理嵌套路由
const routeByPath = new Map<RouteRecordRaw['path'], RouteRecordRaw>(routes.map((route) => [route.path, route]))
const childRouteByPath = new Map<RouteRecordRaw['path'], RouteRecordRaw>()
routeByPath.forEach((currentRoute, currenPath) => {
  const parentPath = getParentPath(currenPath)
  const parentRoute = routeByPath.get(parentPath)
  if (!parentRoute) return
  const children = parentRoute.children || []
  children.push(currentRoute)
  childRouteByPath.set(currenPath, currentRoute)
  parentRoute.children = children
})
const pageRoutes = routes.filter((route) => !childRouteByPath.has(route.path))
export default pageRoutes

function getParentPath(path: string) {
  const parentPath = path.substring(0, path.lastIndexOf('/'))
  return parentPath
}
