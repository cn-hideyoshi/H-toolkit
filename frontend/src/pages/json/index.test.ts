/* eslint-disable vue/one-component-per-file */
import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MessagePlugin } from 'tdesign-vue-next'

import JsonIndex from './index.vue'
import { Compress, DecodeUnicode, EncodeUnicode, Escape, Format, Unescape } from '../../../wailsjs/go/utils/Json'

vi.mock('tdesign-vue-next', () => ({
  MessagePlugin: {
    error: vi.fn(),
  },
}))

vi.mock('../../../wailsjs/go/utils/Json', () => ({
  Compress: vi.fn(),
  DecodeUnicode: vi.fn(),
  EncodeUnicode: vi.fn(),
  Escape: vi.fn(),
  Format: vi.fn(),
  Unescape: vi.fn(),
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

const TRadioButtonStub = defineComponent({
  name: 'TRadioButtonStub',
  template: '<span><slot /></span>',
})

const TRadioGroupStub = defineComponent({
  name: 'TRadioGroupStub',
  props: {
    modelValue: {
      type: String,
      default: 'source',
    },
  },
  emits: ['update:modelValue'],
  template: `
    <div>
      <button type="button" @click="$emit('update:modelValue', 'source')">源码视图</button>
      <button type="button" @click="$emit('update:modelValue', 'tree')">树形视图</button>
      <slot />
    </div>
  `,
})

const LayoutStub = defineComponent({
  template: '<div><slot /></div>',
})

const JsonTreeViewStub = defineComponent({
  name: 'JsonTreeViewStub',
  template: '<div data-testid="json-tree-view">json-tree-view</div>',
})

const mountPage = () =>
  mount(JsonIndex, {
    global: {
      stubs: {
        JsonTreeView: JsonTreeViewStub,
        'json-tree-view': JsonTreeViewStub,
        't-button': TButtonStub,
        't-card': TCardStub,
        't-col': LayoutStub,
        't-radio-button': TRadioButtonStub,
        't-radio-group': TRadioGroupStub,
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
  vi.mocked(Format).mockResolvedValue('{\n  "name": "kit"\n}')
  vi.mocked(Compress).mockResolvedValue('{"name":"kit"}')
  vi.mocked(Escape).mockResolvedValue('"plain\\ntext"')
  vi.mocked(Unescape).mockResolvedValue('plain\ntext')
  vi.mocked(EncodeUnicode).mockResolvedValue('"hello"')
  vi.mocked(DecodeUnicode).mockResolvedValue('hello')
})

describe('JsonIndex', () => {
  it('formats JSON and writes the result to the output panel', async () => {
    const wrapper = mountPage()

    await wrapper.get('textarea[placeholder="请输入 JSON 或文本"]').setValue('{"name":"kit"}')
    await clickButton('格式化', wrapper)
    await flushPromises()

    expect(Format).toHaveBeenCalledWith('{"name":"kit"}')
    expect(wrapper.findAll('textarea')[1].element.value).toBe('{\n  "name": "kit"\n}')
    expect(wrapper.text()).toContain('输出为合法 JSON，可切换树形视图')
  })

  it('switches to tree view when the output is valid JSON', async () => {
    const wrapper = mountPage()

    await wrapper.get('textarea[placeholder="请输入 JSON 或文本"]').setValue('{"name":"kit"}')
    await clickButton('格式化', wrapper)
    await flushPromises()
    await clickButton('树形视图', wrapper)
    await flushPromises()

    expect(wrapper.find('[data-testid="json-tree-view"]').exists()).toBe(true)
  })

  it('shows an error message when processing fails', async () => {
    vi.mocked(Compress).mockRejectedValueOnce(new Error('invalid json'))

    const wrapper = mountPage()

    await wrapper.get('textarea[placeholder="请输入 JSON 或文本"]').setValue('bad-json')
    await clickButton('压缩', wrapper)
    await flushPromises()

    expect(MessagePlugin.error).toHaveBeenCalledWith('invalid json')
  })

  it('loads demo content and clears both panels', async () => {
    const wrapper = mountPage()

    await clickButton('加载 JSON Demo', wrapper)
    expect(wrapper.findAll('textarea')[0].element.value).toContain('"app": "H-toolkit"')
    expect(wrapper.findAll('textarea')[1].element.value).toContain('"app": "H-toolkit"')

    await clickButton('清空', wrapper)

    expect(wrapper.findAll('textarea')[0].element.value).toBe('')
    expect(wrapper.findAll('textarea')[1].element.value).toBe('')
  })
})
