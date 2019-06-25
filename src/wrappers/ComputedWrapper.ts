import { getCurrentVue } from '../runtimeContext';
import { proxy } from '../utils';
import AbstractWrapper from './AbstractWrapper';

interface ComputedInternal<T> {
  read(): T;
  write?(x: T): void;
}

export default class ComputedWrapper<V> extends AbstractWrapper<V> {
  constructor(private _internal: ComputedInternal<V>) {
    super();
  }

  get value() {
    return this._internal.read();
  }

  set value(val: V) {
    if (!this._internal.write) {
      if (process.env.NODE_ENV !== 'production') {
        getCurrentVue().util.warn(
          'Computed property' +
            (this._propName ? ` "${this._propName}"` : '') +
            ' was assigned to but it has no setter.',
          this._vm
        );
      }
    } else {
      this._internal.write(val);
    }
  }

  exposeToDevtool() {
    if (process.env.NODE_ENV !== 'production') {
      const vm = this._vm!;
      const name = this._propName!;

      if (!vm.$options.computed) {
        vm.$options.computed = {};
      }

      proxy(vm.$options.computed, name, () => ({
        get: () => this.value,
        set: (val: any) => {
          this.value = val;
        },
      }));
    }
  }
}
