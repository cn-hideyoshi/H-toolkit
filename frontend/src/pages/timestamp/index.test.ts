/* eslint-disable vue/one-component-per-file */
import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MessagePlugin } from 'tdesign-vue-next'

import TimestampIndex from './index.vue'
import {
  DateTimeToMilliseconds,
  DateTimeToSeconds,
  MillisecondsToDateTime,
  NowMilliseconds,
  NowSeconds,
  SecondsToDateTime,
} from '../../../wailsjs/go/utils/Timestamp'

vi.mock('tdesign-vue-next', () => ({
  MessagePlugin: {
    error: vi.fn(),
  },
}))

vi.mock('../../../wailsjs/go/utils/Timestamp', () => ({
  DateTimeToMilliseconds: vi.fn(),
  DateTimeToSeconds: vi.fn(),
  MillisecondsToDateTime: vi.fn(),
  NowMilliseconds: vi.fn(),
  NowSeconds: vi.fn(),
  SecondsToDateTime: vi.fn(),
}))

const TButtonStub = defineComponent({
  name: 'TButtonStub',
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  template: '<button :disabled="loading" @click="$emit(\'click\')"><slot /></button>',
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
  mount(TimestampIndex, {
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
  vi.mocked(NowSeconds).mockResolvedValue('1700000000')
  vi.mocked(NowMilliseconds).mockResolvedValue('1700000000123')
  vi.mocked(SecondsToDateTime).mockResolvedValue('2023-11-14 22:13:20')
  vi.mocked(MillisecondsToDateTime).mockResolvedValue('2023-11-14 22:13:20')
  vi.mocked(DateTimeToSeconds).mockResolvedValue('1700000000')
  vi.mocked(DateTimeToMilliseconds).mockResolvedValue('1700000000123')
})

describe('TimestampIndex', () => {
  it('loads the current timestamps on mount', async () => {
    const wrapper = mountPage()

    await flushPromises()

    const inputs = wrapper.findAll('input')
    expect(inputs[0].element.value).toBe('1700000000')
    expect(inputs[1].element.value).toBe('1700000000123')
    expect(NowSeconds).toHaveBeenCalledTimes(1)
    expect(NowMilliseconds).toHaveBeenCalledTimes(1)
  })

  it('converts seconds to a datetime string', async () => {
    const wrapper = mountPage()

    await flushPromises()
    await wrapper.get('input[placeholder="请输入秒或毫秒时间戳"]').setValue('1700000000')
    await clickButton('秒转日期', wrapper)
    await flushPromises()

    expect(SecondsToDateTime).toHaveBeenCalledWith('1700000000')
    expect(wrapper.findAll('textarea')[0].element.value).toBe('2023-11-14 22:13:20')
  })

  it('shows an error message when a conversion fails', async () => {
    vi.mocked(SecondsToDateTime).mockRejectedValueOnce(new Error('invalid timestamp'))

    const wrapper = mountPage()

    await flushPromises()
    await wrapper.get('input[placeholder="请输入秒或毫秒时间戳"]').setValue('bad-input')
    await clickButton('秒转日期', wrapper)
    await flushPromises()

    expect(MessagePlugin.error).toHaveBeenCalledWith('invalid timestamp')
  })
})
