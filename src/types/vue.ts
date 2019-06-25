import Vue, { VNode } from 'vue/';

export interface Context {
  readonly parent: Vue;
  readonly root: Vue;
  readonly refs: { [key: string]: Vue | Element | Vue[] | Element[] };
  readonly slots: { [key: string]: VNode[] | undefined };
  readonly attrs: Record<string, string>;

  emit(event: string, ...args: any[]): void;
}
