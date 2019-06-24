import { proxy } from '../utils';
import AbstractWrapper from './AbstractWrapper';

interface ValueInteral<T> {
  $$state: T;
}

export default class ValueWrapper<V> extends AbstractWrapper<V> {
  constructor(private _interal: ValueInteral<V>) {
    super();
  }

  get value() {
    return this._interal.$$state;
  }

  set value(v: V) {
    this._interal.$$state = v;
  }

  exposeToDevltool() {
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
