/* eslint-disable vue/one-component-per-file */
import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MessagePlugin } from 'tdesign-vue-next'

import EncodingIndex from './index.vue'
import {
  Base64Decode,
  Base64Encode,
  GenerateUUID,
  NormalizeUUID,
  URLDecode,
  URLEncode,
} from '../../../wailsjs/go/utils/Encoding'

vi.mock('tdesign-vue-next', () => ({
  MessagePlugin: {
    error: vi.fn(),
  },
}))

vi.mock('../../../wailsjs/go/utils/Encoding', () => ({
  Base64Decode: vi.fn(),
  Base64Encode: vi.fn(),
  GenerateUUID: vi.fn(),
  NormalizeUUID: vi.fn(),
  URLDecode: vi.fn(),
  URLEncode: vi.fn(),
}))

const TButtonStub = defineComponent({
  name: 'TButtonStub',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  template: '<button :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>',
})

const TInputStub = defineComponent({
  name: 'TInputStub',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  methods: {
    onInput(event: Event) {
      this.$emit('update:modelValue', (event.target as HTMLInputElement).value)
    },
  },
  template: '<input :value="modelValue" :placeholder="placeholder" :readonly="readonly" @input="onInput" />',
})

const TTextareaStub = defineComponent({
  name: 'TTextareaStub',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  methods: {
    onInput(event: Event) {
      this.$emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
    },
  },
  template: '<textarea :value="modelValue" :placeholder="placeholder" :readonly="readonly" @input="onInput" />',
})

const TCardStub = defineComponent({
  name: 'TCardStub',
  props: {
    title: {
      type: String,
      default: '',
    },
  },
  template: '<section><h1>{{ title }}</h1><slot /></section>',
})

const LayoutStub = defineComponent({
  template: '<div><slot /></div>',
})

const mountPage = () =>
  mount(EncodingIndex, {
    global: {
      stubs: {
        't-button': TButtonStub,
        't-card': TCardStub,
        't-col': LayoutStub,
        't-input': TInputStub,
        't-row': LayoutStub,
        't-textarea': TTextareaStub,
      },
    },
  })

const clickButton = async (text: string, wrapper: ReturnType<typeof mountPage>) => {
  const button = wrapper.findAll('button').find((item) => item.text() === text)

  expect(button).toBeDefined()
  await button!.trigger('click')
}

beforeEach(() => {
  vi.mocked(Base64Encode).mockResolvedValue('SC10b29sa2l0')
  vi.mocked(Base64Decode).mockResolvedValue('H-toolkit')
  vi.mocked(URLEncode).mockResolvedValue('Hello+World')
  vi.mocked(URLDecode).mockResolvedValue('Hello World')
  vi.mocked(GenerateUUID).mockResolvedValue('550e8400-e29b-41d4-a716-446655440000')
  vi.mocked(NormalizeUUID).mockResolvedValue('550e8400-e29b-41d4-a716-446655440000')
})

describe('EncodingIndex', () => {
  it('encodes base64 text and writes the result to the output panel', async () => {
    const wrapper = mountPage()

    await wrapper.findAll('textarea')[0].setValue('H-toolkit')
    await clickButton('Base64 编码', wrapper)
    await flushPromises()

    expect(Base64Encode).toHaveBeenCalledWith('H-toolkit')
    expect(wrapper.findAll('textarea')[1].element.value).toBe('SC10b29sa2l0')
  })

  it('shows an error message when url decode fails', async () => {
    vi.mocked(URLDecode).mockRejectedValueOnce(new Error('invalid url-encoded input'))

    const wrapper = mountPage()

    await wrapper.findAll('textarea')[2].setValue('100%')
    await clickButton('URL 解码', wrapper)
    await flushPromises()

    expect(MessagePlugin.error).toHaveBeenCalledWith('invalid url-encoded input')
  })

  it('generates a uuid and reflects it in input and output', async () => {
    const wrapper = mountPage()

    await clickButton('生成 UUID v4', wrapper)
    await flushPromises()

    const uuidInput = wrapper.get('input[placeholder="请输入 UUID 或点击生成"]').element as HTMLInputElement

    expect(GenerateUUID).toHaveBeenCalledTimes(1)
    expect(uuidInput.value).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(wrapper.findAll('textarea')[4].element.value).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  it('normalizes uuid input', async () => {
    const wrapper = mountPage()

    await wrapper.get('input[placeholder="请输入 UUID 或点击生成"]').setValue('550E8400-E29B-41D4-A716-446655440000')
    await clickButton('规范化/校验', wrapper)
    await flushPromises()

    expect(NormalizeUUID).toHaveBeenCalledWith('550E8400-E29B-41D4-A716-446655440000')
    expect(wrapper.findAll('textarea')[4].element.value).toBe('550e8400-e29b-41d4-a716-446655440000')
  })
})
