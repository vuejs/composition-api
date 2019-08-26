import Vue, { VueConstructor, VNode, ComponentOptions as Vue2ComponentOptions } from 'vue';
import { ComponentPropsOptions, ExtractPropTypes } from './componentProps';
import { UnwrapRef } from '../reactivity';

export type Data = { [key: string]: unknown };

export type ComponentInstance = InstanceType<VueConstructor>;

// public properties exposed on the proxy, which is used as the render context
// in templates (as `this` in the render option)
type ComponentRenderProxy<P = {}, S = {}, PublicProps = P> = {
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
type VueConstructorProxy<PropsOptions, RawBindings> = {
  new (): ComponentRenderProxy<
    ExtractPropTypes<PropsOptions>,
    UnwrapRef<RawBindings>,
    ExtractPropTypes<PropsOptions, false>
  >;
} & VueConstructor<never>;

type VueProxy<PropsOptions, RawBindings> = Vue2ComponentOptions<
  never,
  UnwrapRef<RawBindings>,
  never,
  never,
  PropsOptions,
  ExtractPropTypes<PropsOptions, false>
> &
  VueConstructorProxy<PropsOptions, RawBindings>;

export interface SetupContext {
  readonly attrs: Record<string, string>;
  readonly slots: { [key: string]: VNode[] | undefined };
  readonly parent: ComponentInstance | null;
  readonly root: ComponentInstance;

  emit(event: string, ...args: any[]): void;
}

type RenderFunction<Props> = (props: Props, ctx: SetupContext) => VNode;

export type SetupFunction<Props, RawBindings> = (
  this: void,
  props: Props,
  ctx: SetupContext
) => RawBindings | RenderFunction<Props>;

interface ComponentOptions<
  PropsOptions = ComponentPropsOptions,
  RawBindings = Data,
  Props = ExtractPropTypes<PropsOptions>
> {
  props?: PropsOptions;
  setup?: SetupFunction<Props, RawBindings>;
}

// Conditional returns can enforce identical types.
// See here: https://github.com/Microsoft/TypeScript/issues/27024#issuecomment-421529650
// prettier-ignore
type Equal<Left, Right> =
  (<U>() => U extends Left ? 1 : 0) extends (<U>() => U extends Right ? 1 : 0) ? true : false;

type HasDefined<T> = Equal<T, unknown> extends true ? false : true;

// object format with object props declaration
// see `ExtractPropTypes` in ./componentProps.ts
export function createComponent<Props, RawBindings = Data, PropsOptions = ComponentPropsOptions>(
  // prettier-ignore
  options: (
    // prefer the provided Props, otherwise infer it from PropsOptions
    HasDefined<Props> extends true
      ? ComponentOptions<PropsOptions, RawBindings, Props>
      : ComponentOptions<PropsOptions, RawBindings>) &
    Omit<Vue2ComponentOptions<Vue>, keyof ComponentOptions<never, never>>
): VueProxy<PropsOptions, RawBindings>;
// implementation, close to no-op
export function createComponent(options: any) {
  return options as any;
}
