// import Vue from 'vue';
import Vue, { ComponentOptions } from 'vue';
import { SetupContext } from '../types/vue';

export type PropType<T> = T;

// type FullPropType<T> = T extends { required: boolean } ? T : T | undefined;
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type ComponentOptionsWithSetup<Props> = Omit<ComponentOptions<Vue>, 'props' | 'setup'> & {
  props?: Props;
  setup?: (
    this: undefined,
    props: { [K in keyof Props]: Props[K] },
    context: SetupContext
  ) => object | null | undefined | void;
};

export function createComponent<Props>(
  compOpions: ComponentOptionsWithSetup<Props>
): ComponentOptions<Vue> {
  return (compOpions as any) as ComponentOptions<Vue>;
}
