import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import uniq from 'lodash/uniq'

// 自动导入modules文件夹下所有ts文件
const modules = import.meta.glob('./modules/**/*.ts', { eager: true }) as Record<
  string,
  { default: any[] }
>

// 路由暂存
const routeModuleList: Array<any> = []

Object.keys(modules).forEach((key) => {
  const mod = modules[key].default || {}
  const modList = Array.isArray(mod) ? [...mod] : [mod]
  routeModuleList.push(...modList)
})

// 关于单层路由，meta 中设置 { single: true } 即可为单层路由，{ hidden: true } 即可在侧边栏隐藏该路由

// 存放动态路由
export const asyncRouterList: Array<any> = [...routeModuleList]

// 存放固定的路由
const defaultRouterList: Array<any> = [
  {
    path: '/',
    redirect: '/dashboard/base',
  },
  {
    path: '/:w+',
    name: '404Page',
    redirect: '/result/404',
  },
]

export const allRoutes = [...defaultRouterList, ...asyncRouterList]

export const getRoutesExpanded = () => {
  const expandedRoutes = []

  allRoutes.forEach((item) => {
    if (item.meta && item.meta.expanded) {
      expandedRoutes.push(item.path)
    }
    if (item.children && item.children.length > 0) {
      item.children
        .filter((child) => child.meta && child.meta.expanded)
        .forEach((child: any) => {
          expandedRoutes.push(item.path)
          expandedRoutes.push(`${item.path}/${child.path}`)
        })
    }
  })
  return uniq(expandedRoutes)
}

export const getActive = (maxLevel = 3): string => {
  // 非组件内调用必须通过Router实例获取当前路由
  const route = router.currentRoute.value

  if (!route.path) {
    return ''
  }
  return route.path
    .split('/')
    .filter((_item: string, index: number) => index <= maxLevel && index > 0)
    .map((item: string) => `/${item}`)
    .join('')
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: allRoutes,
  scrollBehavior() {  
    return {
      el: '#app',
      top: 0,
      behavior: 'smooth',
    }
  },
})

export default router
