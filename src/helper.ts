import Vue, { VueConstructor } from 'vue';
import {
  DefaultMethods,
  DefaultComputed,
  DefaultProps,
  DefaultData,
  ThisTypedComponentOptionsWithRecordProps,
  ThisTypedComponentOptionsWithArrayProps,
} from 'vue/types/options';
import { ComponentInstance } from './component';
import { currentVue, getCurrentVM } from './runtimeContext';
import { assert } from './utils';
import { CombinedVueInstance } from 'vue/types/vue';

export function ensureCurrentVMInFn(hook: string): ComponentInstance {
  const vm = getCurrentVM();
  if (process.env.NODE_ENV !== 'production') {
    assert(vm, `"${hook}" get called outside of "setup()"`);
  }
  return vm!;
}

// props array
export function createComponentInstance<
  V extends Vue = Vue,
  Data = DefaultData<V>,
  Methods = DefaultMethods<V>,
  Computed = DefaultComputed,
  PropsNames extends string = ''
>(
  Ctor: VueConstructor<V>,
  options?: ThisTypedComponentOptionsWithArrayProps<V, Data, Methods, Computed, PropsNames>
): CombinedVueInstance<V, Data, Methods, Computed, Record<PropsNames, unknown>>;
// typed props
export function createComponentInstance<
  V extends Vue = Vue,
  Data = DefaultData<V>,
  Methods = DefaultMethods<V>,
  Computed = DefaultComputed,
  Props = DefaultProps
>(
  Ctor: VueConstructor<V>,
  options: ThisTypedComponentOptionsWithRecordProps<V, Data, Methods, Computed, Props> = {}
) {
  const silent = Ctor.config.silent;
  Ctor.config.silent = true;
  const vm = new Ctor(options);
  Ctor.config.silent = silent;

  return vm;
}

export function isComponentInstance(obj: any) {
  return currentVue && obj instanceof currentVue;
}
