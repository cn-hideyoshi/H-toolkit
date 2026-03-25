<template>
  <div class="json-tree-node">
    <div class="node-row" :class="{ 'node-row-root': isRoot }">
      <span class="indentation" aria-hidden="true">
        <span v-for="step in level" :key="step" class="indent-guide" />
      </span>

      <button
        v-if="isExpandable"
        type="button"
        class="toggle-button"
        :aria-label="expanded ? '折叠节点' : '展开节点'"
        @click="expanded = !expanded"
      >
        <span class="toggle-chevron" :class="{ 'toggle-chevron-expanded': expanded }" />
      </button>
      <span v-else class="toggle-placeholder" />

      <span v-if="showLabel" :class="['node-key', { 'node-key-index': isArrayItem }]">
        {{ displayLabel }}
      </span>
      <span v-if="showLabel" class="node-colon">:</span>

      <template v-if="isContainer">
        <span class="node-punctuation">{{ openingSymbol }}</span>
        <template v-if="isExpandable && !expanded">
          <span v-if="collapsedPreview" class="node-preview">{{ collapsedPreview }}</span>
          <span class="node-punctuation">{{ closingSymbol }}</span>
        </template>
        <template v-else-if="!isExpandable">
          <span class="node-punctuation">{{ closingSymbol }}</span>
        </template>
        <span class="node-meta">{{ containerSummary }}</span>
      </template>

      <span v-else :class="valueClass">{{ valueLabel }}</span>
    </div>

    <div v-if="isExpandable && expanded" class="node-children">
      <JsonTreeNode
        v-for="child in childNodes"
        :key="child.key"
        :label="child.label"
        :value="child.value"
        :level="level + 1"
        :is-array-item="child.isArrayItem"
      />

      <div class="node-row node-row-closing">
        <span class="indentation" aria-hidden="true">
          <span v-for="step in level" :key="step" class="indent-guide" />
        </span>
        <span class="toggle-placeholder" />
        <span class="node-punctuation">{{ closingSymbol }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'JsonTreeNode',
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }

const props = withDefaults(
  defineProps<{
    label?: string
    value: JsonValue
    level?: number
    isRoot?: boolean
    isArrayItem?: boolean
  }>(),
  {
    level: 0,
    isRoot: false,
    isArrayItem: false,
  },
)

const isContainer = computed(() => props.value !== null && typeof props.value === 'object')

const childNodes = computed(() => {
  if (!isContainer.value) {
    return []
  }

  if (Array.isArray(props.value)) {
    return props.value.map((item, index) => ({
      key: `${index}`,
      label: `${index}`,
      value: item,
      isArrayItem: true,
    }))
  }

  return Object.entries(props.value).map(([key, value]) => ({
    key,
    label: key,
    value,
    isArrayItem: false,
  }))
})

const isExpandable = computed(() => isContainer.value && childNodes.value.length > 0)
const expanded = ref(props.isRoot || props.level < 1)

const showLabel = computed(() => !props.isRoot && props.label !== undefined)
const displayLabel = computed(() => (props.isArrayItem ? `[${props.label ?? ''}]` : JSON.stringify(props.label ?? '')))
const openingSymbol = computed(() => (Array.isArray(props.value) ? '[' : '{'))
const closingSymbol = computed(() => (Array.isArray(props.value) ? ']' : '}'))

const truncateText = (value: string, maxLength = 28): string =>
  value.length > maxLength ? `${value.slice(0, maxLength)}…` : value

const previewValue = (value: JsonValue, depth = 0): string => {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return ''
    }

    if (depth > 0) {
      return `Array(${value.length})`
    }

    const items = value.slice(0, 3).map((item) => previewValue(item, depth + 1))
    return `${items.join(', ')}${value.length > 3 ? ', …' : ''}`
  }

  if (value === null) {
    return 'null'
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value)

    if (entries.length === 0) {
      return ''
    }

    if (depth > 0) {
      return `{${entries.length}}`
    }

    const parts = entries
      .slice(0, 2)
      .map(([key, childValue]) => `${JSON.stringify(key)}: ${previewValue(childValue, depth + 1)}`)
    return `${parts.join(', ')}${entries.length > 2 ? ', …' : ''}`
  }

  if (typeof value === 'string') {
    return JSON.stringify(truncateText(value))
  }

  return String(value)
}

const collapsedPreview = computed(() => {
  if (!isContainer.value || !isExpandable.value) {
    return ''
  }

  return previewValue(props.value)
})

const containerSummary = computed(() => {
  if (!isContainer.value) {
    return ''
  }

  if (Array.isArray(props.value)) {
    return `${props.value.length} 项`
  }

  return `${Object.keys(props.value).length} 个键`
})

const valueLabel = computed(() => {
  if (props.value === null) {
    return 'null'
  }

  if (typeof props.value === 'string') {
    return JSON.stringify(props.value)
  }

  return String(props.value)
})

const valueClass = computed(() => {
  if (props.value === null) {
    return 'node-value value-null'
  }

  if (typeof props.value === 'string') {
    return 'node-value value-string'
  }

  if (typeof props.value === 'number') {
    return 'node-value value-number'
  }

  return 'node-value value-boolean'
})
</script>

<style scoped lang="less">
.json-tree-node {
  --indent-size: 16px;
  --row-height: 24px;
  --guide-color: rgb(15 23 42 / 10%);
  --hover-bg: rgb(9 30 66 / 6%);
  --mono-font: 'SFMono-Regular', 'SF Mono', Consolas, 'Liberation Mono', Menlo, 'Courier New', monospace;

  font-family: var(--mono-font);
  font-size: 13px;

  .node-row {
    display: flex;
    align-items: center;
    min-height: var(--row-height);
    padding-right: 12px;
    line-height: var(--row-height);
    white-space: nowrap;
    border-radius: 4px;
    transition: background-color 160ms ease;

    &:hover {
      background: var(--hover-bg);
    }
  }

  .node-row-root {
    padding-left: 8px;
  }

  .indentation {
    display: flex;
    flex: 0 0 auto;
    align-self: stretch;
  }

  .indent-guide {
    position: relative;
    width: var(--indent-size);

    &::before {
      position: absolute;
      top: 0;
      bottom: 0;
      left: calc(var(--indent-size) / 2);
      width: 1px;
      content: '';
      background: var(--guide-color);
    }
  }

  .toggle-button,
  .toggle-placeholder {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: var(--row-height);
    flex: 0 0 16px;
    margin-right: 2px;
  }

  .toggle-button {
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  .toggle-chevron {
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-left: 6px solid #6b7280;
    transition: transform 160ms ease;
    transform-origin: 35% 50%;
  }

  .toggle-chevron-expanded {
    transform: rotate(90deg);
  }

  .node-key,
  .node-colon,
  .node-punctuation,
  .node-preview,
  .node-meta,
  .node-value {
    display: inline-block;
  }

  .node-key {
    color: #881280;
  }

  .node-key-index {
    color: #6f42c1;
  }

  .node-colon,
  .node-punctuation {
    color: #4b5563;
  }

  .node-colon {
    margin-right: 6px;
  }

  .node-preview,
  .node-value {
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .node-preview {
    margin: 0 4px;
    color: #6b7280;
  }

  .node-meta {
    margin-left: 8px;
    color: #94a3b8;
    font-size: 12px;
  }

  .node-row-closing {
    padding-right: 12px;
  }

  .value-string {
    color: #c41a16;
  }

  .value-number {
    color: #1c00cf;
  }

  .value-boolean {
    color: #0f68a0;
  }

  .value-null {
    color: #aa0d91;
  }
}
</style>
