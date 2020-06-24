import { ExtractPropTypes } from './componentProps'
import { UnwrapRef } from '..'
import { Data } from './common'

import Vue, {
  VueConstructor,
  ComponentOptions as Vue2ComponentOptions,
} from 'vue'
import {
  ComputedOptions,
  MethodOptions,
  ExtractComputedReturns,
} from './componentOptions'

export type ComponentInstance = InstanceType<VueConstructor>

// public properties exposed on the proxy, which is used as the render context
// in templates (as `this` in the render option)
export type ComponentRenderProxy<
  P = {}, // props type extracted from props option
  B = {}, // raw bindings returned from setup()
  D = {}, // return from data()
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  PublicProps = P
> = {
  $data: D
  $props: Readonly<P & PublicProps>
  $attrs: Data
  $refs: Data
  $slots: Data
  $root: ComponentInstance | null
  $parent: ComponentInstance | null
  $emit: (event: string, ...args: unknown[]) => void
} & Readonly<P> &
  UnwrapRef<B> &
  D &
  M &
  ExtractComputedReturns<C> &
  Vue

// for Vetur and TSX support
type VueConstructorProxy<PropsOptions, RawBindings> = VueConstructor & {
  new (...args: any[]): ComponentRenderProxy<
    ExtractPropTypes<PropsOptions>,
    UnwrapRef<RawBindings>,
    ExtractPropTypes<PropsOptions, false>
  >
}

type DefaultData<V> = object | ((this: V) => object)
type DefaultMethods<V> = { [key: string]: (this: V, ...args: any[]) => any }
type DefaultComputed = { [key: string]: any }

export type VueProxy<
  PropsOptions,
  RawBindings,
  Data = DefaultData<Vue>,
  Computed = DefaultComputed,
  Methods = DefaultMethods<Vue>
> = Vue2ComponentOptions<
  Vue,
  UnwrapRef<RawBindings> & Data,
  Methods,
  Computed,
  PropsOptions,
  ExtractPropTypes<PropsOptions, false>
> &
  VueConstructorProxy<PropsOptions, RawBindings>
