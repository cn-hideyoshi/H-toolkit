import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/json',
    name: 'Json',
    component: Layout,
    redirect: '/json/index',
    meta: { title: 'JSON 工具', icon: 'code' },
    children: [
      {
        path: 'index',
        name: 'JsonIndex',
        component: () => import('@/pages/json/index.vue'),
        meta: { title: 'JSON 处理' },
      },
    ],
  },
];
