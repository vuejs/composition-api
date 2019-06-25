import { VueConstructor } from 'vue';
import { getCurrentVue } from '../runtimeContext';
import { ensureCurrentVMInFn } from '../helper';
import { UnknownObject } from '../types/basic';
import { hasOwn } from '../utils';

function resolveInject(
  provideKey: InjectKey,
  vm: InstanceType<VueConstructor>
): UnknownObject | void {
  let source = vm;
  while (source) {
    // @ts-ignore
    if (source._provided && hasOwn(source._provided, provideKey)) {
      //@ts-ignore
      return source._provided[provideKey];
    }
    source = source.$parent;
  }

  if (process.env.NODE_ENV !== 'production') {
    getCurrentVue().util.warn(`Injection "${String(provideKey)}" not found`, vm);
  }
}

type InjectKey = string | symbol;
type ProvideOption = { [key: string]: any } | (() => { [key: string]: any });

export function provide(provideOption: ProvideOption) {
  if (!provideOption) {
    return;
  }

  const vm = ensureCurrentVMInFn('provide');
  (vm as any)._provided =
    typeof provideOption === 'function' ? provideOption.call(vm) : provideOption;
}

export function inject(injectKey: InjectKey) {
  if (!injectKey) {
    return;
  }

  const vm = ensureCurrentVMInFn('inject');
  return resolveInject(injectKey, vm);
}
