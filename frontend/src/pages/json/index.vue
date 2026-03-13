<template>
  <div class="json-tool">
    <t-card title="JSON 工具">
      <div class="action-row">
        <t-button variant="outline" @click="handleLoadDemo">加载 Demo</t-button>
        <t-button :loading="loading" @click="handleFormat">格式化</t-button>
        <t-button :loading="loading" @click="handleCompress">压缩</t-button>
        <t-button :loading="loading" @click="handleEscape">添加转义</t-button>
        <t-button :loading="loading" @click="handleUnescape">去除转义</t-button>
        <t-button :loading="loading" @click="handleEncodeUnicode">Unicode_JS 编码</t-button>
        <t-button :loading="loading" @click="handleDecodeUnicode">Unicode_JS 解码</t-button>
        <t-button theme="danger" variant="outline" @click="handleClear">清空</t-button>
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
            处理结果为空，暂时没有可展示的树形结构。
          </div>

          <div v-else-if="treeStatus === 'error'" class="tree-placeholder tree-placeholder-error">
            当前输出不是合法 JSON，无法切换到树形视图。
          </div>

          <JsonTreeView v-else :data="parsedTreeData" />
        </t-col>
      </t-row>
    </t-card>
  </div>
</template>

<script lang="ts">
export default {
  name: 'JsonIndex',
};
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { Compress, DecodeUnicode, EncodeUnicode, Escape, Format, Unescape } from '../../../wailsjs/go/utils/Json';
import JsonTreeView from './components/JsonTreeView.vue';

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

const inputText = ref('');
const outputText = ref('');
const loading = ref(false);
const outputViewMode = ref<'source' | 'tree'>('source');
const demoJson = `{
  "app": "H-toolkit",
  "version": "0.0.1",
  "enabled": true,
  "count": 3,
  "meta": {
    "owner": "hideyoshi",
    "tags": ["json", "tree-view", "demo"],
    "updatedAt": "2026-03-14T10:00:00+08:00"
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
      "name": "Source View",
      "status": "done"
    }
  ],
  "nullableField": null
}`;

const stripWrappingQuotes = (value: string): string => {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  return value;
};

const ensureWrappedQuotes = (value: string): string => {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value;
  }
  return `"${value}"`;
};

const handleError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  MessagePlugin.error(message || '处理失败');
};

const runAction = async (action: () => Promise<string>) => {
  if (loading.value) return;
  loading.value = true;
  try {
    outputText.value = await action();
  } catch (error) {
    handleError(error);
  } finally {
    loading.value = false;
  }
};

const handleFormat = async () => {
  await runAction(() => Format(inputText.value));
};

const handleCompress = async () => {
  await runAction(() => Compress(inputText.value));
};

const handleEscape = async () => {
  await runAction(async () => stripWrappingQuotes(await Escape(inputText.value)));
};

const handleUnescape = async () => {
  await runAction(() => Unescape(ensureWrappedQuotes(inputText.value)));
};

const handleEncodeUnicode = async () => {
  await runAction(async () => stripWrappingQuotes(await EncodeUnicode(inputText.value)));
};

const handleDecodeUnicode = async () => {
  await runAction(() => DecodeUnicode(inputText.value));
};

const handleLoadDemo = () => {
  inputText.value = demoJson;
  outputText.value = demoJson;
  outputViewMode.value = 'source';
};

const handleClear = () => {
  inputText.value = '';
  outputText.value = '';
};

const parsedOutput = computed<{ status: 'empty' } | { status: 'error' } | { status: 'success'; value: JsonValue }>(() => {
  const content = outputText.value.trim();

  if (!content) {
    return { status: 'empty' };
  }

  try {
    return {
      status: 'success',
      value: JSON.parse(content) as JsonValue,
    };
  } catch (error) {
    return { status: 'error' };
  }
});

const treeStatus = computed(() => parsedOutput.value.status);
const parsedTreeData = computed<JsonValue | null>(() =>
  parsedOutput.value.status === 'success' ? parsedOutput.value.value : null,
);
</script>

<style scoped lang="less">
.json-tool {
  .action-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .panel-title {
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
}
</style>
