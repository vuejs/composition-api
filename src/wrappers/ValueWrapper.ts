import { proxy } from '../utils';
import AbstractWrapper from './AbstractWrapper';

interface ValueInternal<T> {
  $$state: T;
}

export default class ValueWrapper<V> extends AbstractWrapper<V> {
  constructor(private _internal: ValueInternal<V>) {
    super();
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
      proxy(
        vm._data,
        name,
        () => this.value,
        (val: any) => {
          this.value = val;
        }
      );
    }
  }
}
