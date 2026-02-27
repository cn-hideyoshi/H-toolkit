import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/timestamp',
    name: 'Timestamp',
    component: Layout,
    redirect: '/timestamp/index',
    meta: { title: '时间戳工具', icon: 'time' },
    children: [
      {
        path: 'index',
        name: 'TimestampIndex',
        component: () => import('@/pages/timestamp/index.vue'),
        meta: { title: '时间戳转换' },
      },
    ],
  },
];
