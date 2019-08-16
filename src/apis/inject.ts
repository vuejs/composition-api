import { ComponentInstance } from '../component';
import { isRef, Ref, createRef } from '../reactivity';
import { ensureCurrentVMInFn } from '../helper';
import { hasOwn, warn } from '../utils';

const NOT_FOUND = {};
export interface InjectionKey<T> extends Symbol {}

function resolveInject(provideKey: InjectionKey<any>, vm: ComponentInstance): any {
  let source = vm;
  while (source) {
    // @ts-ignore
    if (source._provided && hasOwn(source._provided, provideKey)) {
      //@ts-ignore
      return source._provided[provideKey];
    }
    source = source.$parent;
  }

  return NOT_FOUND;
}

function createInjectValue<T>(value: T, vm: ComponentInstance): Ref<T> {
  return isRef<T>(value)
    ? value
    : createRef<T>({
        get: () => value,
        set() {
          warn(`The injectd value can't be re-assigned`, vm);
        },
      });
}

export function provide<T>(key: InjectionKey<T> | string, value: T | Ref<T>): void {
  const vm: any = ensureCurrentVMInFn('provide');
  if (!vm._provided) {
    vm._provided = {};
  }

  vm._provided[key as string] = value;
}

export function inject<T>(key: InjectionKey<T> | string, defaultValue?: T): Ref<T> | void {
  if (!key) {
    return;
  }

  const vm = ensureCurrentVMInFn('inject');
  const val = resolveInject(key as InjectionKey<T>, vm);
  if (val !== NOT_FOUND) {
    return createInjectValue(val, vm);
  } else if (defaultValue) {
    return createInjectValue(defaultValue, vm);
  } else if (process.env.NODE_ENV !== 'production') {
    warn(`Injection "${String(key)}" not found`, vm);
  }
}
