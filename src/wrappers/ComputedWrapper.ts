import { getCurrentVue } from '../runtimeContext';
import AbstractWrapper, { proxy } from './AbstractWrapper';

interface ComputedInteral<T> {
  read(): T;
  write?(x: T): void;
}

export default class ComputedWrapper<V> extends AbstractWrapper<V> {
  constructor(private _interal: ComputedInteral<V>) {
    super();
  }

  get value() {
    return this._interal.read();
  }

  set value(val: V) {
    if (!this._interal.write) {
      if (process.env.NODE_ENV !== 'production') {
        getCurrentVue().util.warn(
          'Computed property' +
            (this._propName ? ` "${this._propName}"` : '') +
            ' was assigned to but it has no setter.',
          this._vm
        );
      }
    } else {
      this._interal.write(val);
    }
  }

  exposeToDevltool() {
    if (process.env.NODE_ENV !== 'production') {
      const vm = this._vm!;
      const name = this._propName!;

      if (!vm.$options.computed) {
        vm.$options.computed = {};
      }

      proxy(
        vm.$options.computed,
        name,
        () => this.value,
        (val: any) => {
          this.value = val;
        }
      );
    }
  }
}
