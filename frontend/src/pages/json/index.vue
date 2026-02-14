<template>
  <div class="json-tool">
    <t-card title="JSON 工具">
      <div class="action-row">
        <t-button :loading="loading" @click="handleFormat">格式化</t-button>
        <t-button :loading="loading" @click="handleCompress">压缩</t-button>
        <t-button :loading="loading" @click="handleEscape">添加转义</t-button>
        <t-button :loading="loading" @click="handleUnescape">去除转义</t-button>
        <t-button :loading="loading" @click="handleEncodeUnicode">Unicode_JS 编码</t-button>
        <t-button :loading="loading" @click="handleDecodeUnicode">Unicode_JS 解码</t-button>
        <t-button theme="danger" variant="outline" @click="handleClear">清空</t-button>
      </div>

      <t-row :gutter="[16, 16]">
        <t-col :span="6">
          <div class="panel-title">输入</div>
          <t-textarea
            v-model="inputText"
            class="editor"
            :autosize="{ minRows: 18, maxRows: 28 }"
            placeholder="请输入 JSON 或文本"
          />
        </t-col>
        <t-col :span="6">
          <div class="panel-title">输出</div>
          <t-textarea
            v-model="outputText"
            class="editor"
            readonly
            :autosize="{ minRows: 18, maxRows: 28 }"
            placeholder="处理结果将显示在这里"
          />
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
import { ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { Compress, DecodeUnicode, EncodeUnicode, Escape, Format, Unescape } from '../../../wailsjs/go/utils/Json';

const inputText = ref('');
const outputText = ref('');
const loading = ref(false);

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

const handleClear = () => {
  inputText.value = '';
  outputText.value = '';
};
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
    margin-bottom: 8px;
    font-weight: 500;
  }

  .editor {
    width: 100%;
  }
}
</style>
