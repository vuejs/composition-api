// import Vue from 'vue';
import Vue, { ComponentOptions } from 'vue';
import { PropsDefinition } from 'vue/types/options';
import { SetupContext } from '../types/vue';

// export type PropType<T> = T;

// type FullPropType<T> = T extends { required: boolean } ? T : T | undefined;
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type ComponentOptionsWithSetup<Props> = Omit<ComponentOptions<Vue>, 'props' | 'setup'> & {
  props?: PropsDefinition<Props>;
  setup?: (
    this: undefined,
    props: Readonly<Props>,
    context: SetupContext
  ) => object | null | undefined | void;
};

// when props is an object
export function createComponent<Props>(
  compOpions: ComponentOptionsWithSetup<Props>
): ComponentOptions<Vue>;
// when props is an array
export function createComponent<Props extends string = never>(
  compOpions: ComponentOptionsWithSetup<Record<Props, any>>
): ComponentOptions<Vue>;

export function createComponent<Props>(
  compOpions: ComponentOptionsWithSetup<Props>
): ComponentOptions<Vue> {
  return (compOpions as any) as ComponentOptions<Vue>;
}
