<template>
  <div class="encoding-tool">
    <t-card title="文本/编码工具">
      <div class="helper-grid">
        <div class="helper-card">
          <div class="helper-title">工具组范围</div>
          <div class="helper-value">Base64 / URL / UUID</div>
          <div class="helper-description">面向常用开发调试场景，保留和现有工具一致的页面交互节奏。</div>
        </div>
        <div class="helper-card helper-card-accent">
          <div class="helper-title">URL 语义</div>
          <div class="helper-value">按 QueryEscape / QueryUnescape 处理</div>
          <div class="helper-description">本页只处理 query-component 编解码，不做整 URL 重写。</div>
        </div>
        <div class="helper-card">
          <div class="helper-title">UUID 规则</div>
          <div class="helper-value">生成 UUID v4，规范化输出为小写 canonical</div>
          <div class="helper-description">校验失败会直接提示错误，不保留无效输出。</div>
        </div>
      </div>

      <t-row :gutter="[16, 16]">
        <t-col :xs="12" :lg="4">
          <div class="panel">
            <div class="panel-title">Base64</div>
            <div class="panel-tip">支持普通 UTF-8 文本编码和 Base64 解码。</div>
            <t-textarea
              v-model="base64Input"
              :autosize="{ minRows: 8, maxRows: 12 }"
              placeholder="请输入要编码或解码的文本"
            />
            <div class="button-row">
              <t-button
                :disabled="!base64Input.trim() || base64Loading"
                :loading="base64Loading"
                @click="handleBase64Encode"
              >
                Base64 编码
              </t-button>
              <t-button
                :disabled="!base64Input.trim() || base64Loading"
                :loading="base64Loading"
                @click="handleBase64Decode"
              >
                Base64 解码
              </t-button>
              <t-button theme="danger" variant="outline" @click="clearBase64">清空</t-button>
            </div>
            <t-textarea
              v-model="base64Output"
              readonly
              :autosize="{ minRows: 8, maxRows: 12 }"
              placeholder="处理结果将显示在这里"
            />
          </div>
        </t-col>

        <t-col :xs="12" :lg="4">
          <div class="panel">
            <div class="panel-title">URL</div>
            <div class="panel-tip">适用于 query 参数内容的编码和解码。</div>
            <t-textarea
              v-model="urlInput"
              :autosize="{ minRows: 8, maxRows: 12 }"
              placeholder="请输入要编码或解码的文本"
            />
            <div class="button-row">
              <t-button :disabled="!urlInput.trim() || urlLoading" :loading="urlLoading" @click="handleUrlEncode">
                URL 编码
              </t-button>
              <t-button :disabled="!urlInput.trim() || urlLoading" :loading="urlLoading" @click="handleUrlDecode">
                URL 解码
              </t-button>
              <t-button theme="danger" variant="outline" @click="clearUrl">清空</t-button>
            </div>
            <t-textarea
              v-model="urlOutput"
              readonly
              :autosize="{ minRows: 8, maxRows: 12 }"
              placeholder="处理结果将显示在这里"
            />
          </div>
        </t-col>

        <t-col :xs="12" :lg="4">
          <div class="panel">
            <div class="panel-title">UUID</div>
            <div class="panel-tip">生成 UUID v4，或把已有 UUID 规范化为小写标准格式。</div>
            <t-input v-model="uuidInput" placeholder="请输入 UUID 或点击生成" />
            <div class="button-row">
              <t-button :loading="uuidLoading" @click="handleGenerateUUID">生成 UUID v4</t-button>
              <t-button
                :disabled="!uuidInput.trim() || uuidLoading"
                :loading="uuidLoading"
                @click="handleNormalizeUUID"
              >
                规范化/校验
              </t-button>
              <t-button theme="danger" variant="outline" @click="clearUuid">清空</t-button>
            </div>
            <t-textarea
              v-model="uuidOutput"
              readonly
              :autosize="{ minRows: 12, maxRows: 16 }"
              placeholder="UUID 结果将显示在这里"
            />
          </div>
        </t-col>
      </t-row>
    </t-card>
  </div>
</template>

<script lang="ts">
export default {
  name: 'EncodingIndex',
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import {
  Base64Decode,
  Base64Encode,
  GenerateUUID,
  NormalizeUUID,
  URLDecode,
  URLEncode,
} from '../../../wailsjs/go/utils/Encoding'

const base64Input = ref('')
const base64Output = ref('')
const base64Loading = ref(false)

const urlInput = ref('')
const urlOutput = ref('')
const urlLoading = ref(false)

const uuidInput = ref('')
const uuidOutput = ref('')
const uuidLoading = ref(false)

const handleError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  MessagePlugin.error(message || '处理失败')
}

const ensureValue = (value: string, message: string) => {
  if (value.trim()) {
    return true
  }

  MessagePlugin.error(message)
  return false
}

const runAction = async (loading: Ref<boolean>, action: () => Promise<void>) => {
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

const handleBase64Encode = async () => {
  if (!ensureValue(base64Input.value, '请输入 Base64 文本')) return

  await runAction(base64Loading, async () => {
    base64Output.value = await Base64Encode(base64Input.value)
  })
}

const handleBase64Decode = async () => {
  if (!ensureValue(base64Input.value, '请输入 Base64 文本')) return

  await runAction(base64Loading, async () => {
    base64Output.value = await Base64Decode(base64Input.value)
  })
}

const handleUrlEncode = async () => {
  if (!ensureValue(urlInput.value, '请输入 URL 文本')) return

  await runAction(urlLoading, async () => {
    urlOutput.value = await URLEncode(urlInput.value)
  })
}

const handleUrlDecode = async () => {
  if (!ensureValue(urlInput.value, '请输入 URL 文本')) return

  await runAction(urlLoading, async () => {
    urlOutput.value = await URLDecode(urlInput.value)
  })
}

const handleGenerateUUID = async () => {
  await runAction(uuidLoading, async () => {
    const generated = await GenerateUUID()
    uuidInput.value = generated
    uuidOutput.value = generated
  })
}

const handleNormalizeUUID = async () => {
  if (!ensureValue(uuidInput.value, '请输入 UUID')) return

  await runAction(uuidLoading, async () => {
    uuidOutput.value = await NormalizeUUID(uuidInput.value)
  })
}

const clearBase64 = () => {
  base64Input.value = ''
  base64Output.value = ''
}

const clearUrl = () => {
  urlInput.value = ''
  urlOutput.value = ''
}

const clearUuid = () => {
  uuidInput.value = ''
  uuidOutput.value = ''
}
</script>

<style scoped lang="less">
.encoding-tool {
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
    background: radial-gradient(circle at top right, rgb(64 158 255 / 12%) 0%, transparent 36%),
      linear-gradient(180deg, rgb(255 255 255 / 98%) 0%, rgb(245 250 254 / 98%) 100%);
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
    margin-bottom: 8px;
    font-weight: 500;
  }

  .panel-tip {
    margin-bottom: 12px;
    color: var(--td-text-color-secondary);
    font-size: 12px;
    line-height: 1.6;
  }

  .button-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 12px 0;
  }

  @media (max-width: 1200px) {
    .helper-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
