import Vue, { VueConstructor, VNode, ComponentOptions as Vue2ComponentOptions } from 'vue';
import { ComponentPropsOptions, ExtractPropTypes } from './componentProps';
import { UnwrapRef } from '../reactivity';
import { HasDefined } from '../types/basic';

export type Data = { [key: string]: unknown };

export type ComponentInstance = InstanceType<VueConstructor>;

// public properties exposed on the proxy, which is used as the render context
// in templates (as `this` in the render option)
export type ComponentRenderProxy<P = {}, S = {}, PublicProps = P> = {
  $data: S;
  $props: PublicProps;
  $attrs: Data;
  $refs: Data;
  $slots: Data;
  $root: ComponentInstance | null;
  $parent: ComponentInstance | null;
  $emit: (event: string, ...args: unknown[]) => void;
} & P &
  S;

// for Vetur and TSX support
type VueConstructorProxy<PropsOptions, RawBindings> = VueConstructor & {
  new (...args: any[]): ComponentRenderProxy<
    ExtractPropTypes<PropsOptions>,
    UnwrapRef<RawBindings>,
    ExtractPropTypes<PropsOptions, false>
  >;
};

type VueProxy<PropsOptions, RawBindings> = Vue2ComponentOptions<
  Vue,
  UnwrapRef<RawBindings>,
  never,
  never,
  PropsOptions,
  ExtractPropTypes<PropsOptions, false>
> &
  VueConstructorProxy<PropsOptions, RawBindings>;

export interface SetupContext {
  readonly attrs: Record<string, string>;
  readonly slots: { [key: string]: (...args: any[]) => VNode[] };
  readonly parent: ComponentInstance | null;
  readonly root: ComponentInstance;
  readonly listeners: { [key: string]: Function };

  emit(event: string, ...args: any[]): void;
}

export type SetupFunction<Props, RawBindings> = (
  this: void,
  props: Props,
  ctx: SetupContext
) => RawBindings | (() => VNode | null);

interface ComponentOptionsWithProps<
  PropsOptions = ComponentPropsOptions,
  RawBindings = Data,
  Props = ExtractPropTypes<PropsOptions>
> {
  props?: PropsOptions;
  setup?: SetupFunction<Props, RawBindings>;
}

interface ComponentOptionsWithoutProps<Props = unknown, RawBindings = Data> {
  props?: undefined;
  setup?: SetupFunction<Props, RawBindings>;
}

// overload 1: object format with no props
export function defineComponent<RawBindings>(
  options: ComponentOptionsWithoutProps<unknown, RawBindings>
): VueProxy<unknown, RawBindings>;
// overload 2: object format with object props declaration
// see `ExtractPropTypes` in ./componentProps.ts
export function defineComponent<
  Props,
  RawBindings = Data,
  PropsOptions extends ComponentPropsOptions = ComponentPropsOptions
>(
  // prettier-ignore
  options: (
    // prefer the provided Props, otherwise infer it from PropsOptions
    HasDefined<Props> extends true
      ? ComponentOptionsWithProps<PropsOptions, RawBindings, Props>
      : ComponentOptionsWithProps<PropsOptions, RawBindings>) &
    Omit<Vue2ComponentOptions<Vue>, keyof ComponentOptionsWithProps<never, never>>
): VueProxy<PropsOptions, RawBindings>;
// implementation, close to no-op
export function defineComponent(options: any) {
  return options as any;
}

// createComponent is kept around for retro-compatibility
// overload 1: object format with no props
export function createComponent<RawBindings>(
  options: ComponentOptionsWithoutProps<unknown, RawBindings>
): VueProxy<unknown, RawBindings>;
// overload 2: object format with object props declaration
// see `ExtractPropTypes` in ./componentProps.ts
export function createComponent<
  Props,
  RawBindings = Data,
  PropsOptions extends ComponentPropsOptions = ComponentPropsOptions
>(
  // prettier-ignore
  options: (
    // prefer the provided Props, otherwise infer it from PropsOptions
    HasDefined<Props> extends true
      ? ComponentOptionsWithProps<PropsOptions, RawBindings, Props>
      : ComponentOptionsWithProps<PropsOptions, RawBindings>) &
    Omit<Vue2ComponentOptions<Vue>, keyof ComponentOptionsWithProps<never, never>>
): VueProxy<PropsOptions, RawBindings>;
// implementation, deferring to defineComponent, but logging a warning in dev mode
export function createComponent(options: any) {
  if (process.env.NODE_ENV !== 'production') {
    Vue.util.warn('`createComponent` has been renamed to `defineComponent`.');
  }
  return defineComponent(options);
}
