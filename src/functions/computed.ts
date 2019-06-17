import { compoundComputed } from '../helper';
import { IWrapper } from '../types/lib';
import ComputedWrapper from '../wrappers/ComputedWrapper';

export function computed<T>(getter: () => T, setter?: (x: T) => void): IWrapper<T> {
  const computedHost = compoundComputed({
    $$state: setter
      ? {
          get: getter,
          set: setter,
        }
      : getter,
  });

  return new ComputedWrapper({
    read: () => computedHost.$$state,
    write: (v: T) => {
      computedHost.$$state = v;
    },
  });
}
