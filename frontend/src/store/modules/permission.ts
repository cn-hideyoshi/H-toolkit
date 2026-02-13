import { defineStore } from 'pinia';
import { asyncRouterList } from '@/router';
import { store } from '@/store';

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    whiteListRouters: ['/login'],
    routers: asyncRouterList,
    removeRoutes: [],
  }),
  actions: {
    async initRoutes(_roles: Array<unknown>) {
      this.routers = asyncRouterList;
      this.removeRoutes = [];
    },
    async restore() {
      this.removeRoutes = [];
    },
  },
});

export function getPermissionStore() {
  return usePermissionStore(store);
}
