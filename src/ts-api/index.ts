// import Vue from 'vue';
import Vue, { ComponentOptions } from 'vue';
import { Context } from '../types/vue';

export type PropType<T> = T;

// type FullPropType<T> = T extends { required: boolean } ? T : T | undefined;

interface ComponentOptionsWithSetup<Props> extends Omit<ComponentOptions<Vue>, 'props' | 'setup'> {
  props: Props;
  setup?: (
    this: undefined,
    props: { [K in keyof Props]: Props[K] },
    context: Context
  ) => object | null | undefined | void;
}

export function createComponent<Props>(compOpions: ComponentOptionsWithSetup<Props>) {
  return compOpions;
}
