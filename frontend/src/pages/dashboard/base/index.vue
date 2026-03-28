<template>
  <div class="dashboard-base">
    <section class="section-block">
      <div class="section-head">
        <div>
          <p class="section-kicker">Tool Entry</p>
          <h1 class="section-title">选择一个工具开始使用</h1>
          <p class="section-description">首页仅保留工具跳转入口，直接进入具体处理页面。</p>
        </div>
      </div>

      <t-row :gutter="[16, 16]">
        <t-col v-for="tool in toolCards" :key="tool.path" :xs="12" :lg="4">
          <article :class="['tool-card', `tool-card-${tool.tone}`]">
            <div class="tool-card-header">
              <span class="tool-badge">{{ tool.badge }}</span>
              <span class="tool-status">{{ tool.status }}</span>
            </div>
            <h3 class="tool-title">{{ tool.title }}</h3>
            <p class="tool-description">{{ tool.description }}</p>
            <ul class="tool-list">
              <li v-for="highlight in tool.highlights" :key="highlight">{{ highlight }}</li>
            </ul>
            <t-button theme="default" variant="outline" @click="goTo(tool.path)">{{ tool.actionText }}</t-button>
          </article>
        </t-col>
      </t-row>
    </section>
  </div>
</template>

<script lang="ts">
export default {
  name: 'DashboardBase',
}
</script>

<script setup lang="ts">
import { useRouter } from 'vue-router'

type ToolCard = {
  actionText: string
  badge: string
  description: string
  highlights: string[]
  path: string
  status: string
  title: string
  tone: 'sunrise' | 'ocean' | 'forest'
}

const router = useRouter()

const toolCards: ToolCard[] = [
  {
    badge: 'JSON',
    title: 'JSON 工具',
    description: '格式化、压缩、转义、Unicode 编解码和树形视图都集中在一个页面内。',
    highlights: ['适合调试接口返回值', '支持对象 Demo 与文本 Demo', '输出结果可直接切换源码/树形视图'],
    path: '/json/index',
    status: '已可用',
    actionText: '进入 JSON 工具',
    tone: 'sunrise',
  },
  {
    badge: 'TEXT',
    title: '文本/编码工具',
    description: '聚合 Base64、URL、UUID 三类常用编码与标识处理能力。',
    highlights: ['支持 Base64 编解码', '支持 URL QueryEscape / QueryUnescape', '支持 UUID v4 生成与规范化'],
    path: '/encoding/index',
    status: '已可用',
    actionText: '进入文本/编码工具',
    tone: 'forest',
  },
  {
    badge: 'TIME',
    title: '时间戳工具',
    description: '覆盖秒级、毫秒级、日期字符串与 RFC3339 格式之间的常用转换。',
    highlights: ['自动获取当前时间戳', '支持本地时间与 RFC3339 输入', '界面内提供快速示例输入'],
    path: '/timestamp/index',
    status: '已可用',
    actionText: '进入时间戳工具',
    tone: 'ocean',
  },
]

const goTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped lang="less">
.dashboard-base {
  padding: 8px 0 24px;

  .section-block {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .section-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
  }

  .section-kicker {
    margin: 0;
    color: #9a6b17;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .section-title {
    margin: 6px 0 0;
    color: var(--td-text-color-primary);
    font-size: 28px;
    line-height: 1.2;
  }

  .section-description {
    margin: 8px 0 0;
    color: var(--td-text-color-secondary);
    line-height: 1.7;
  }

  .tool-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    padding: 20px;
    border: 1px solid var(--td-border-level-1-color);
    border-radius: 20px;
    background: linear-gradient(180deg, rgb(255 255 255 / 98%) 0%, rgb(248 250 252 / 98%) 100%);
    box-shadow: 0 14px 28px rgb(15 23 42 / 6%);
  }

  .tool-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .tool-badge,
  .tool-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  .tool-card-sunrise .tool-badge {
    color: #a24f0d;
    background: rgb(255 181 71 / 18%);
  }

  .tool-card-ocean .tool-badge {
    color: #0f5b88;
    background: rgb(64 158 255 / 14%);
  }

  .tool-card-forest .tool-badge {
    color: #136f63;
    background: rgb(20 184 166 / 14%);
  }

  .tool-status {
    color: #12724b;
    background: rgb(18 114 75 / 10%);
  }

  .tool-title {
    margin: 0;
    color: #203247;
    font-size: 22px;
  }

  .tool-description {
    margin: 0;
    color: var(--td-text-color-secondary);
    line-height: 1.75;
  }

  .tool-list {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .tool-list li {
    position: relative;
    padding-left: 18px;
    color: var(--td-text-color-secondary);
    line-height: 1.65;
  }

  .tool-list li::before {
    position: absolute;
    top: 10px;
    left: 0;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    content: '';
    background: linear-gradient(135deg, #ffb547 0%, #f46b45 100%);
    box-shadow: 0 0 0 4px rgb(244 107 69 / 8%);
  }

  @media (max-width: 768px) {
    .section-title {
      font-size: 22px;
    }
  }
}
</style>
