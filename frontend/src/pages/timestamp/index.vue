<template>
  <div class="timestamp-tool">
    <t-card title="时间戳工具">
      <div class="action-row">
        <t-button :loading="loading" @click="handleRefreshNow">刷新当前时间戳</t-button>
      </div>

      <t-row :gutter="[16, 16]">
        <t-col :xs="12" :lg="4">
          <div class="panel">
            <div class="panel-title">当前时间戳</div>
            <div class="field-label">秒级</div>
            <t-input v-model="nowSeconds" readonly />
            <div class="field-label">毫秒级</div>
            <t-input v-model="nowMilliseconds" readonly />
          </div>
        </t-col>

        <t-col :xs="12" :lg="4">
          <div class="panel">
            <div class="panel-title">时间戳转日期时间</div>
            <t-input v-model="timestampInput" placeholder="请输入秒或毫秒时间戳" />
            <div class="button-row">
              <t-button :loading="loading" @click="handleSecondsToDateTime">秒转日期</t-button>
              <t-button :loading="loading" @click="handleMillisecondsToDateTime">毫秒转日期</t-button>
              <t-button theme="danger" variant="outline" @click="handleClearTimestampPanel">清空</t-button>
            </div>
            <t-textarea
              v-model="timestampOutput"
              readonly
              :autosize="{ minRows: 5, maxRows: 8 }"
              placeholder="转换结果将显示在这里"
            />
          </div>
        </t-col>

        <t-col :xs="12" :lg="4">
          <div class="panel">
            <div class="panel-title">日期时间转时间戳</div>
            <t-input v-model="dateTimeInput" placeholder="请输入日期时间字符串" />
            <div class="button-row">
              <t-button :loading="loading" @click="handleDateTimeToSeconds">转秒时间戳</t-button>
              <t-button :loading="loading" @click="handleDateTimeToMilliseconds">转毫秒时间戳</t-button>
              <t-button theme="danger" variant="outline" @click="handleClearDateTimePanel">清空</t-button>
            </div>
            <t-textarea
              v-model="dateTimeOutput"
              readonly
              :autosize="{ minRows: 5, maxRows: 8 }"
              placeholder="转换结果将显示在这里"
            />
          </div>
        </t-col>
      </t-row>

      <div class="helper-text">
        支持日期格式：YYYY-MM-DD HH:mm:ss、YYYY-MM-DDTHH:mm:ss、YYYY-MM-DD、RFC3339、RFC3339Nano
      </div>
    </t-card>
  </div>
</template>

<script lang="ts">
export default {
  name: 'TimestampIndex',
};
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import {
  DateTimeToMilliseconds,
  DateTimeToSeconds,
  MillisecondsToDateTime,
  NowMilliseconds,
  NowSeconds,
  SecondsToDateTime,
} from '../../../wailsjs/go/utils/Timestamp';

const loading = ref(false);

const nowSeconds = ref('');
const nowMilliseconds = ref('');

const timestampInput = ref('');
const timestampOutput = ref('');

const dateTimeInput = ref('');
const dateTimeOutput = ref('');

const handleError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  MessagePlugin.error(message || '处理失败');
};

const runAction = async (action: () => Promise<void>) => {
  if (loading.value) return;
  loading.value = true;
  try {
    await action();
  } catch (error) {
    handleError(error);
  } finally {
    loading.value = false;
  }
};

const handleRefreshNow = async () => {
  await runAction(async () => {
    const [seconds, milliseconds] = await Promise.all([NowSeconds(), NowMilliseconds()]);
    nowSeconds.value = seconds;
    nowMilliseconds.value = milliseconds;
  });
};

const handleSecondsToDateTime = async () => {
  await runAction(async () => {
    timestampOutput.value = await SecondsToDateTime(timestampInput.value);
  });
};

const handleMillisecondsToDateTime = async () => {
  await runAction(async () => {
    timestampOutput.value = await MillisecondsToDateTime(timestampInput.value);
  });
};

const handleDateTimeToSeconds = async () => {
  await runAction(async () => {
    dateTimeOutput.value = await DateTimeToSeconds(dateTimeInput.value);
  });
};

const handleDateTimeToMilliseconds = async () => {
  await runAction(async () => {
    dateTimeOutput.value = await DateTimeToMilliseconds(dateTimeInput.value);
  });
};

const handleClearTimestampPanel = () => {
  timestampInput.value = '';
  timestampOutput.value = '';
};

const handleClearDateTimePanel = () => {
  dateTimeInput.value = '';
  dateTimeOutput.value = '';
};

onMounted(() => {
  void handleRefreshNow();
});
</script>

<style scoped lang="less">
.timestamp-tool {
  .action-row {
    margin-bottom: 16px;
  }

  .panel {
    height: 100%;
    padding: 12px;
    border: 1px solid var(--td-border-level-1-color);
    border-radius: var(--td-radius-default);
  }

  .panel-title {
    margin-bottom: 12px;
    font-weight: 500;
  }

  .field-label {
    margin: 10px 0 6px;
  }

  .button-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 12px 0;
  }

  .helper-text {
    margin-top: 16px;
    color: var(--td-text-color-secondary);
    font-size: 12px;
  }
}
</style>
