<template>
  <div class="json-tool">
    <t-card title="JSON 工具">
      <div class="action-row">
        <t-button variant="outline" @click="handleLoadJsonDemo">加载 JSON Demo</t-button>
        <t-button variant="outline" @click="handleLoadTextDemo">加载文本 Demo</t-button>
        <t-button :disabled="!hasInput || loading" :loading="loading" @click="handleFormat">格式化</t-button>
        <t-button :disabled="!hasInput || loading" :loading="loading" @click="handleCompress">压缩</t-button>
        <t-button :disabled="!hasInput || loading" :loading="loading" @click="handleEscape">添加转义</t-button>
        <t-button :disabled="!hasInput || loading" :loading="loading" @click="handleUnescape">去除转义</t-button>
        <t-button :disabled="!hasInput || loading" :loading="loading" @click="handleEncodeUnicode"
          >Unicode_JS 编码</t-button
        >
        <t-button :disabled="!hasInput || loading" :loading="loading" @click="handleDecodeUnicode"
          >Unicode_JS 解码</t-button
        >
        <t-button :disabled="!hasOutput" theme="default" variant="outline" @click="handleUseOutputAsInput"
          >输出回填输入</t-button
        >
        <t-button theme="danger" variant="outline" @click="handleClear">清空</t-button>
      </div>

      <div class="helper-grid">
        <div class="helper-card">
          <div class="helper-title">输入状态</div>
          <div class="helper-value">{{ inputStateText }}</div>
          <div class="helper-description">{{ inputMetricsText }}</div>
        </div>
        <div class="helper-card">
          <div class="helper-title">输出状态</div>
          <div class="helper-value">{{ outputStateText }}</div>
          <div class="helper-description">{{ outputMetricsText }}</div>
        </div>
        <div class="helper-card helper-card-accent">
          <div class="helper-title">使用提示</div>
          <div class="helper-value">格式化/压缩要求输入是合法 JSON</div>
          <div class="helper-description">转义、去转义和 Unicode 编解码按普通文本处理。</div>
        </div>
      </div>

      <t-row :gutter="[16, 16]">
        <t-col :xs="12" :lg="6">
          <div class="panel-title">输入</div>
          <t-textarea
            v-model="inputText"
            class="editor"
            :autosize="{ minRows: 18, maxRows: 28 }"
            placeholder="请输入 JSON 或文本"
          />
        </t-col>
        <t-col :xs="12" :lg="6">
          <div class="panel-header">
            <div class="panel-title">输出</div>
            <t-radio-group v-model="outputViewMode" variant="default-filled">
              <t-radio-button value="source">源码视图</t-radio-button>
              <t-radio-button value="tree">树形视图</t-radio-button>
            </t-radio-group>
          </div>

          <t-textarea
            v-if="outputViewMode === 'source'"
            v-model="outputText"
            class="editor"
            readonly
            :autosize="{ minRows: 18, maxRows: 28 }"
            placeholder="处理结果将显示在这里"
          />

          <div v-else-if="treeStatus === 'empty'" class="tree-placeholder">
            当前没有输出结果，先执行一次处理操作再切换树形视图。
          </div>

          <div v-else-if="treeStatus === 'error'" class="tree-placeholder tree-placeholder-error">
            当前输出不是合法 JSON，树形视图仅支持展示合法 JSON 结果。
          </div>

          <json-tree-view v-else :data="parsedTreeData" />
        </t-col>
      </t-row>
    </t-card>
  </div>
</template>

<script lang="ts">
export default {
  name: 'JsonIndex',
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { Compress, DecodeUnicode, EncodeUnicode, Escape, Format, Unescape } from '../../../wailsjs/go/utils/Json'
import JsonTreeView from './components/JsonTreeView.vue'

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }
type ParsedOutputState = { status: 'empty' } | { status: 'error' } | { status: 'success'; value: JsonValue }

const inputText = ref('')
const outputText = ref('')
const loading = ref(false)
const outputViewMode = ref<'source' | 'tree'>('source')

const jsonDemo = `{
  "app": "H-toolkit",
  "version": "0.1.0",
  "enabled": true,
  "count": 3,
  "meta": {
    "owner": "hideyoshi",
    "tags": ["json", "tree-view", "desktop"],
    "updatedAt": "2026-03-28T10:00:00+08:00"
  },
  "items": [
    {
      "id": 1,
      "name": "Format JSON",
      "status": "done"
    },
    {
      "id": 2,
      "name": "Tree View",
      "status": "done"
    },
    {
      "id": 3,
      "name": "Release Checklist",
      "status": "in-progress"
    }
  ],
  "nullableField": null
}`

const textDemo = `path=C:\\Projects\\H-toolkit
message="JSON tool ready"
lineBreak=first line\\nsecond line`

const stripWrappingQuotes = (value: string): string => {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1)
  }
  return value
}

const ensureWrappedQuotes = (value: string): string => {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value
  }
  return `"${value}"`
}

const handleError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  MessagePlugin.error(message || '处理失败')
}

const ensureInput = () => {
  if (inputText.value.trim()) {
    return true
  }

  MessagePlugin.error('请输入待处理内容')
  return false
}

const getMetricsText = (value: string) => {
  const normalized = value.replace(/\r\n/g, '\n')

  if (!normalized) {
    return '0 字符，0 行'
  }

  return `${normalized.length} 字符，${normalized.split('\n').length} 行`
}

const parsedOutput = computed<ParsedOutputState>(() => {
  const content = outputText.value.trim()

  if (!content) {
    return { status: 'empty' }
  }

  try {
    return {
      status: 'success',
      value: JSON.parse(content) as JsonValue,
    }
  } catch (_error) {
    return { status: 'error' }
  }
})

const hasInput = computed(() => inputText.value.trim().length > 0)
const hasOutput = computed(() => outputText.value.trim().length > 0)
const inputMetricsText = computed(() => getMetricsText(inputText.value))
const outputMetricsText = computed(() => getMetricsText(outputText.value))

const inputStateText = computed(() => {
  const content = inputText.value.trim()

  if (!content) {
    return '等待输入'
  }

  try {
    JSON.parse(content)
    return '检测到合法 JSON'
  } catch (_error) {
    return '当前按普通文本处理'
  }
})

const outputStateText = computed(() => {
  switch (parsedOutput.value.status) {
    case 'empty':
      return '尚未生成输出'
    case 'error':
      return '当前输出为纯文本'
    case 'success':
      return '输出为合法 JSON，可切换树形视图'
    default:
      return '尚未生成输出'
  }
})

const treeStatus = computed(() => parsedOutput.value.status)
const parsedTreeData = computed<JsonValue | null>(() =>
  parsedOutput.value.status === 'success' ? parsedOutput.value.value : null,
)

const runAction = async (action: () => Promise<string>) => {
  if (loading.value || !ensureInput()) return

  loading.value = true
  try {
    outputText.value = await action()
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}

const handleFormat = async () => {
  await runAction(() => Format(inputText.value))
}

const handleCompress = async () => {
  await runAction(() => Compress(inputText.value))
}

const handleEscape = async () => {
  await runAction(async () => stripWrappingQuotes(await Escape(inputText.value)))
}

const handleUnescape = async () => {
  await runAction(() => Unescape(ensureWrappedQuotes(inputText.value)))
}

const handleEncodeUnicode = async () => {
  await runAction(async () => stripWrappingQuotes(await EncodeUnicode(inputText.value)))
}

const handleDecodeUnicode = async () => {
  await runAction(() => DecodeUnicode(inputText.value))
}

const handleLoadJsonDemo = () => {
  inputText.value = jsonDemo
  outputText.value = jsonDemo
  outputViewMode.value = 'source'
}

const handleLoadTextDemo = () => {
  inputText.value = textDemo
  outputText.value = ''
  outputViewMode.value = 'source'
}

const handleUseOutputAsInput = () => {
  if (!hasOutput.value) {
    MessagePlugin.error('当前没有可回填的输出结果')
    return
  }

  inputText.value = outputText.value
}

const handleClear = () => {
  inputText.value = ''
  outputText.value = ''
  outputViewMode.value = 'source'
}
</script>

<style scoped lang="less">
.json-tool {
  .action-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .helper-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .helper-card {
    padding: 14px 16px;
    border: 1px solid var(--td-border-level-1-color);
    border-radius: 16px;
    background: linear-gradient(180deg, rgb(255 255 255 / 98%) 0%, rgb(248 250 252 / 98%) 100%);
  }

  .helper-card-accent {
    background: radial-gradient(circle at top right, rgb(255 181 71 / 12%) 0%, transparent 36%),
      linear-gradient(180deg, rgb(255 255 255 / 98%) 0%, rgb(252 248 242 / 98%) 100%);
  }

  .helper-title {
    margin-bottom: 6px;
    color: var(--td-text-color-secondary);
    font-size: 12px;
  }

  .helper-value {
    color: var(--td-text-color-primary);
    font-size: 15px;
    font-weight: 600;
  }

  .helper-description {
    margin-top: 6px;
    color: var(--td-text-color-secondary);
    font-size: 13px;
    line-height: 1.6;
  }

  .panel-title {
    margin-bottom: 8px;
    font-weight: 500;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  .editor {
    width: 100%;
  }

  .tree-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 388px;
    padding: 24px;
    color: var(--td-text-color-secondary);
    text-align: center;
    border: 1px dashed var(--td-border-level-2-color);
    border-radius: var(--td-radius-default);
    background: var(--td-bg-color-container);
  }

  .tree-placeholder-error {
    color: var(--td-error-color);
  }

  @media (max-width: 1200px) {
    .helper-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
