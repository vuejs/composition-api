// import Vue, { VueConstructor, VNode, ComponentOptions as Vue2ComponentOptions } from 'vue';
import { VueConstructor, VNode, ComponentOptions as Vue2ComponentOptions } from 'vue';
import { ComponentPropsOptions, ExtractPropTypes } from './componentProps';
import { UnwrapValue } from '../reactivity';

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
    UnwrapValue<RawBindings>,
    ExtractPropTypes<PropsOptions, false>
  >;
};

type VueProxy<PropsOptions, RawBindings> = Vue2ComponentOptions<
  never,
  UnwrapValue<RawBindings>,
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
  root: ComponentInstance;

  emit(event: string, ...args: any[]): void;
}

type RenderFunction<Props> = (props: Props, ctx: SetupContext) => VNode;

export type SetupFunction<Props, RawBindings> = (
  this: void,
  props: Props,
  ctx: SetupContext
) => RawBindings | RenderFunction<Props>;

export interface ComponentOptions<
  PropsOptions = ComponentPropsOptions,
  RawBindings = Data,
  Props = ExtractPropTypes<PropsOptions>
> {
  props?: PropsOptions;
  setup?: SetupFunction<Props, RawBindings>;
}

// object format with object props declaration
// see `ExtractPropTypes` in ./componentProps.ts
export function createComponent<PropsOptions, RawBindings>(
  options: ComponentOptions<PropsOptions, RawBindings>
): VueProxy<PropsOptions, RawBindings>;
// implementation, close to no-op
export function createComponent(options: any) {
  return options as any;
}
