import { IWrapper } from '../types/lib';
import { observable, getCurrentVM } from '../helper';
import ValueWrapper from '../wrappers/ValueWrapper';
import { StateKey } from '../symbols';

const KEY_PREFIX = 'k';
let keyUid = 0;

export function state<T>(value: T): T {
  const vm = getCurrentVM('state') as any;
  let stateContainer = vm[StateKey];
  if (!stateContainer) {
    stateContainer = vm[StateKey] = observable({});
  }

  const stateKey = `${KEY_PREFIX}${keyUid++}`;
  vm.$set(stateContainer, stateKey, value);

  return value;
}

export function value<T>(value: T): IWrapper<T> {
  const vm = getCurrentVM('value') as any;
  let stateContainer = vm[StateKey];
  if (!stateContainer) {
    stateContainer = vm[StateKey] = observable({});
  }

  const stateKey = `${KEY_PREFIX}${keyUid++}`;
  const valueBox: { $$state: T } = { $$state: value };
  vm.$set(stateContainer, stateKey, valueBox);

  return new ValueWrapper(valueBox);
}
