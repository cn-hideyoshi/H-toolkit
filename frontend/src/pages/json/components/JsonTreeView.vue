<template>
  <div class="json-tree-view">
    <json-tree-node :value="data" is-root />
  </div>
</template>

<script lang="ts">
export default {
  name: 'JsonTreeView',
}
</script>

<script setup lang="ts">
import JsonTreeNode from './JsonTreeNode.vue'

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }

defineProps<{
  data: JsonValue
}>()
</script>

<style scoped lang="less">
.json-tree-view {
  min-height: 388px;
  padding: 10px 0;
  overflow: auto;
  border: 1px solid var(--td-border-level-1-color);
  border-radius: var(--td-radius-default);
  background: linear-gradient(180deg, rgb(255 255 255 / 94%) 0%, rgb(247 249 252 / 96%) 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 70%), inset 0 0 0 1px rgb(15 23 42 / 2%);
}
</style>
