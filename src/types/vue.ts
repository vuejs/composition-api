import Vue, { ComponentOptions, VNode } from 'vue/';
import { NormalizedScopedSlot } from 'vue/types/vnode';

export interface Context {
  readonly el: Element;
  readonly options: ComponentOptions<Vue>;
  readonly parent: Vue;
  readonly root: Vue;
  readonly children: Vue[];
  readonly refs: { [key: string]: Vue | Element | Vue[] | Element[] };
  readonly slots: { [key: string]: VNode[] | undefined };
  readonly scopedSlots: { [key: string]: NormalizedScopedSlot | undefined };
  readonly isServer: boolean;
  readonly ssrContext: any;
  readonly vnode: VNode;
  readonly attrs: Record<string, string>; //
  readonly listeners: Record<string, Function | Function[]>;

  on(event: string | string[], callback: Function): this;
  once(event: string | string[], callback: Function): this;
  off(event?: string | string[], callback?: Function): this;
  emit(event: string, ...args: any[]): this;
  forceUpdate(): void;
  destroy(): void;
}
