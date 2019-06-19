import { assert } from '../utils';
import AbstractWrapper from './AbstractWrapper';

interface ComputedInteral<T> {
  read(): T;
  write(x: T): void;
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
        assert(false, `Computed property "${this._name}" was assigned to but it has no setter.`);
      }
    } else {
      this._interal.write(val);
    }
  }
}
