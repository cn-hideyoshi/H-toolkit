import Layout from '@/layouts/index.vue'

export default [
  {
    path: '/encoding',
    name: 'Encoding',
    component: Layout,
    redirect: '/encoding/index',
    meta: { title: '文本/编码工具', icon: 'code', orderNo: 25 },
    children: [
      {
        path: 'index',
        name: 'EncodingIndex',
        component: () => import('@/pages/encoding/index.vue'),
        meta: { title: '编码转换' },
      },
    ],
  },
]
