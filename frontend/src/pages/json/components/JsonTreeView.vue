<template>
  <div class="json-tree-view">
    <JsonTreeNode label="root" :value="data" />
  </div>
</template>

<script lang="ts">
export default {
  name: 'JsonTreeView',
};
</script>

<script setup lang="ts">
import JsonTreeNode from './JsonTreeNode.vue';

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

defineProps<{
  data: JsonValue;
}>();
</script>

<style scoped lang="less">
.json-tree-view {
  min-height: 388px;
  padding: 12px;
  overflow: auto;
  border: 1px solid var(--td-border-level-1-color);
  border-radius: var(--td-radius-default);
  background: var(--td-bg-color-container);
}
</style>
