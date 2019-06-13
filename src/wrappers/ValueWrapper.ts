import Wrapper from './Wrapper';

interface ValueInteral<T> {
  $$state: T;
}

export default class ValueWrapper<V> extends Wrapper<V> {
  constructor(private _interal: ValueInteral<V>) {
    super();
  }

  get value() {
    return this._interal.$$state;
  }

  set value(v: V) {
    this._interal.$$state = v;
  }
}
