<template>
  <div class="json-tree-node">
    <div class="node-line" :style="{ paddingLeft: `${level * 16}px` }">
      <button v-if="isContainer" type="button" class="toggle-button" @click="expanded = !expanded">
        {{ expanded ? 'v' : '>' }}
      </button>
      <span v-else class="toggle-placeholder" />

      <span v-if="label" class="node-key">{{ label }}:</span>
      <span :class="valueClass">{{ valueLabel }}</span>
    </div>

    <div v-if="isContainer && expanded" class="node-children">
      <JsonTreeNode
        v-for="child in childNodes"
        :key="child.key"
        :label="child.label"
        :value="child.value"
        :level="level + 1"
      />
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
  }>(),
  {
    label: '',
    level: 0,
  },
)

const isContainer = computed(() => props.value !== null && typeof props.value === 'object')
const expanded = ref(props.level < 1)

const childNodes = computed(() => {
  if (!isContainer.value) {
    return []
  }

  if (Array.isArray(props.value)) {
    return props.value.map((item, index) => ({
      key: `${index}`,
      label: `[${index}]`,
      value: item,
    }))
  }

  return Object.entries(props.value).map(([key, value]) => ({
    key,
    label: key,
    value,
  }))
})

const valueLabel = computed(() => {
  if (Array.isArray(props.value)) {
    return `Array(${props.value.length})`
  }

  if (props.value === null) {
    return 'null'
  }

  if (typeof props.value === 'object') {
    return `Object{${Object.keys(props.value).length}}`
  }

  if (typeof props.value === 'string') {
    return `"${props.value}"`
  }

  return String(props.value)
})

const valueClass = computed(() => {
  if (Array.isArray(props.value)) {
    return 'value-tag value-array'
  }

  if (props.value === null) {
    return 'value-tag value-null'
  }

  if (typeof props.value === 'object') {
    return 'value-tag value-object'
  }

  if (typeof props.value === 'string') {
    return 'value-tag value-string'
  }

  if (typeof props.value === 'number') {
    return 'value-tag value-number'
  }

  return 'value-tag value-boolean'
})
</script>

<style scoped lang="less">
.json-tree-node {
  .node-line {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    min-height: 28px;
    line-height: 28px;
    white-space: nowrap;
  }

  .toggle-button,
  .toggle-placeholder {
    width: 20px;
    flex: 0 0 20px;
    color: var(--td-text-color-secondary);
    text-align: center;
  }

  .toggle-button {
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    font-family: inherit;
    line-height: 28px;
  }

  .node-key {
    color: var(--td-text-color-primary);
    font-weight: 500;
  }

  .value-tag {
    word-break: break-all;
    white-space: pre-wrap;
  }

  .value-object,
  .value-array {
    color: var(--td-brand-color);
  }

  .value-string {
    color: #2f9e44;
  }

  .value-number {
    color: #d9480f;
  }

  .value-boolean,
  .value-null {
    color: #7b2cbf;
  }
}
</style>
