// import Vue from 'vue';
import Vue, { ComponentOptions, PropOptions, PropType } from 'vue';
import { SetupContext } from '../types/vue';

// export type PropType<T> = T;

// type FullPropType<T> = T extends { required: boolean } ? T : T | undefined;
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type PropValidator<T> = PropOptions<T> | PropType<T>;
type RecordPropsDefinition<T> = {
  [K in keyof T]: PropValidator<T[K]>;
};
type ArrayPropsDefinition<T> = (keyof T)[];
type PropsDefinition<T> = ArrayPropsDefinition<T> | RecordPropsDefinition<T>;
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
