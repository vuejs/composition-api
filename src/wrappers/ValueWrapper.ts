import { proxy, def } from '../utils';
import AbstractWrapper from './AbstractWrapper';

interface ValueInternal<T> {
  $$state: T;
}

export default class ValueWrapper<V> extends AbstractWrapper<V> {
  private _internal!: ValueInternal<V>;

  constructor(internal: ValueInternal<V>) {
    super();
    def(this, '_internal', internal);
  }

  get value() {
    return this._internal.$$state;
  }

  set value(v: V) {
    this._internal.$$state = v;
  }

  exposeToDevtool() {
    if (process.env.NODE_ENV !== 'production') {
      const vm = this._vm!;
      const name = this._propName!;
      proxy(vm._data, name, {
        get: () => this.value,
        set: (val: any) => {
          this.value = val;
        },
      });
    }
  }
}
