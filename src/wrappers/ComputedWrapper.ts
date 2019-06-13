import { assert } from '../utils';
import Wrapper from './Wrapper';

interface ComputedInteral<T> {
  read(): T;
  write(x: T): void;
}

export default class ComputedWrapper<V> extends Wrapper<V> {
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
