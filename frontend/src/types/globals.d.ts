// 通用声明

// Vue
declare module '*.vue' {
  import { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}

declare type ClassName = { [className: string]: any } | ClassName[] | string

declare module '*.svg' {
  const CONTENT: string
  export default CONTENT
}

declare type Recordable<T = any> = Record<string, T>
