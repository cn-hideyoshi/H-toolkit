<template>
  <div class="timestamp-tool">
    <t-card title="时间戳工具">
      <div class="action-row">
        <t-button :loading="loading" @click="handleRefreshNow">刷新当前时间戳</t-button>
        <div class="timezone-badge">当前浏览器时区：{{ browserTimeZone }}</div>
      </div>

      <div class="helper-grid">
        <div class="helper-card">
          <div class="helper-title">当前状态</div>
          <div class="helper-value">支持秒级与毫秒级双向转换</div>
          <div class="helper-description">日期输出按本地时区展示，输入会自动裁剪首尾空格。</div>
        </div>
        <div class="helper-card helper-card-accent">
          <div class="helper-title">支持格式</div>
          <div class="helper-value">YYYY-MM-DD HH:mm:ss / YYYY-MM-DDTHH:mm:ss / RFC3339</div>
          <div class="helper-description">也支持纯日期和 RFC3339Nano。</div>
        </div>
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
            <div class="example-row">
              <t-button variant="text" @click="timestampInput = '1700000000'">秒级示例</t-button>
              <t-button variant="text" @click="timestampInput = '1700000000123'">毫秒示例</t-button>
            </div>
            <div class="panel-tip">{{ timestampTip }}</div>
            <div class="button-row">
              <t-button :disabled="!hasTimestampInput || loading" :loading="loading" @click="handleSecondsToDateTime">
                秒转日期
              </t-button>
              <t-button
                :disabled="!hasTimestampInput || loading"
                :loading="loading"
                @click="handleMillisecondsToDateTime"
              >
                毫秒转日期
              </t-button>
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
            <div class="example-row">
              <t-button variant="text" @click="dateTimeInput = '2026-03-28 08:00:00'">本地时间示例</t-button>
              <t-button variant="text" @click="dateTimeInput = '2026-03-28T08:00:00+08:00'"> RFC3339 示例 </t-button>
            </div>
            <div class="panel-tip">{{ dateTimeTip }}</div>
            <div class="button-row">
              <t-button :disabled="!hasDateTimeInput || loading" :loading="loading" @click="handleDateTimeToSeconds">
                转秒时间戳
              </t-button>
              <t-button
                :disabled="!hasDateTimeInput || loading"
                :loading="loading"
                @click="handleDateTimeToMilliseconds"
              >
                转毫秒时间戳
              </t-button>
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
    </t-card>
  </div>
</template>

<script lang="ts">
export default {
  name: 'TimestampIndex',
}
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import {
  DateTimeToMilliseconds,
  DateTimeToSeconds,
  MillisecondsToDateTime,
  NowMilliseconds,
  NowSeconds,
  SecondsToDateTime,
} from '../../../wailsjs/go/utils/Timestamp'

const loading = ref(false)

const nowSeconds = ref('')
const nowMilliseconds = ref('')

const timestampInput = ref('')
const timestampOutput = ref('')

const dateTimeInput = ref('')
const dateTimeOutput = ref('')

const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local'

const hasTimestampInput = computed(() => timestampInput.value.trim().length > 0)
const hasDateTimeInput = computed(() => dateTimeInput.value.trim().length > 0)

const timestampTip = computed(() =>
  hasTimestampInput.value ? '转换结果将按照本地时区输出日期时间。' : '输入秒级或毫秒级时间戳后再执行转换。',
)

const dateTimeTip = computed(() =>
  hasDateTimeInput.value ? '当前输入将转换为 Unix 时间戳。' : '支持本地时间格式、纯日期和 RFC3339。',
)

const handleError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  MessagePlugin.error(message || '处理失败')
}

const runAction = async (action: () => Promise<void>) => {
  if (loading.value) return

  loading.value = true
  try {
    await action()
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}

const ensureValue = (value: string, message: string) => {
  if (value.trim()) {
    return true
  }

  MessagePlugin.error(message)
  return false
}

const handleRefreshNow = async () => {
  await runAction(async () => {
    const [seconds, milliseconds] = await Promise.all([NowSeconds(), NowMilliseconds()])
    nowSeconds.value = seconds
    nowMilliseconds.value = milliseconds
  })
}

const handleSecondsToDateTime = async () => {
  if (!ensureValue(timestampInput.value, '请输入秒或毫秒时间戳')) return

  await runAction(async () => {
    timestampOutput.value = await SecondsToDateTime(timestampInput.value)
  })
}

const handleMillisecondsToDateTime = async () => {
  if (!ensureValue(timestampInput.value, '请输入秒或毫秒时间戳')) return

  await runAction(async () => {
    timestampOutput.value = await MillisecondsToDateTime(timestampInput.value)
  })
}

const handleDateTimeToSeconds = async () => {
  if (!ensureValue(dateTimeInput.value, '请输入日期时间字符串')) return

  await runAction(async () => {
    dateTimeOutput.value = await DateTimeToSeconds(dateTimeInput.value)
  })
}

const handleDateTimeToMilliseconds = async () => {
  if (!ensureValue(dateTimeInput.value, '请输入日期时间字符串')) return

  await runAction(async () => {
    dateTimeOutput.value = await DateTimeToMilliseconds(dateTimeInput.value)
  })
}

const handleClearTimestampPanel = () => {
  timestampInput.value = ''
  timestampOutput.value = ''
}

const handleClearDateTimePanel = () => {
  dateTimeInput.value = ''
  dateTimeOutput.value = ''
}

onMounted(() => {
  handleRefreshNow()
})
</script>

<style scoped lang="less">
.timestamp-tool {
  .action-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .timezone-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    color: #245167;
    font-size: 12px;
    font-weight: 600;
    border-radius: 999px;
    background: rgb(64 158 255 / 10%);
  }

  .helper-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
    background: radial-gradient(circle at top right, rgb(64 158 255 / 12%) 0%, transparent 38%),
      linear-gradient(180deg, rgb(255 255 255 / 98%) 0%, rgb(246 250 254 / 98%) 100%);
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

  .panel {
    height: 100%;
    padding: 14px;
    border: 1px solid var(--td-border-level-1-color);
    border-radius: 18px;
    background: linear-gradient(180deg, rgb(255 255 255 / 98%) 0%, rgb(249 250 252 / 98%) 100%);
  }

  .panel-title {
    margin-bottom: 12px;
    font-weight: 500;
  }

  .field-label {
    margin: 10px 0 6px;
  }

  .example-row,
  .button-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .example-row {
    margin: 8px 0 4px;
  }

  .panel-tip {
    margin-bottom: 12px;
    color: var(--td-text-color-secondary);
    font-size: 12px;
    line-height: 1.6;
  }

  .button-row {
    margin: 12px 0;
  }

  @media (max-width: 1200px) {
    .helper-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
