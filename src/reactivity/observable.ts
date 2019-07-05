import { AnyObject } from '../types/basic';
import { getCurrentVue } from '../runtimeContext';
import { isObject, def, hasOwn } from '../utils';
import { isWrapper } from '../wrappers';
import { ObservableIdentifierKey, AccessControIdentifierlKey } from '../symbols';

const AccessControlIdentifier = {};
const ObservableIdentifier = {};

function setupAccessControl(target: AnyObject) {
  if (!isObject(target) || isWrapper(target)) {
    return;
  }

  if (
    hasOwn(target, AccessControIdentifierlKey) &&
    target[AccessControIdentifierlKey] === AccessControlIdentifier
  ) {
    return;
  }

  def(target, AccessControIdentifierlKey, AccessControlIdentifier);
  const keys = Object.keys(target);
  for (let i = 0; i < keys.length; i++) {
    defineAccessControl(target, keys[i]);
  }
}

/**
 * Auto unwrapping when acccess property
 */
export function defineAccessControl(target: AnyObject, key: any, val?: any) {
  let getter: (() => any) | undefined;
  let setter: ((x: any) => void) | undefined;
  const property = Object.getOwnPropertyDescriptor(target, key);
  if (property) {
    if (property.configurable === false) {
      return;
    }
    getter = property.get;
    setter = property.set;
    val = target[key];
  }

  setupAccessControl(val);
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get: function getterHandler() {
      const value = getter ? getter.call(target) : val;
      if (isWrapper(value)) {
        return value.value;
      } else {
        return value;
      }
    },
    set: function setterHandler(newVal) {
      if (getter && !setter) return;

      const value = getter ? getter.call(target) : val;
      if (isWrapper(value)) {
        if (isWrapper(newVal)) {
          val = newVal;
        } else {
          value.value = newVal;
        }
      } else if (setter) {
        setter.call(target, newVal);
      } else if (isWrapper(newVal)) {
        val = newVal;
      }
      setupAccessControl(newVal);
    },
  });
}

export function isObservable(obj: any): boolean {
  return (
    hasOwn(obj, ObservableIdentifierKey) && obj[ObservableIdentifierKey] === ObservableIdentifier
  );
}

export function observable<T = any>(obj: T): T {
  if (!isObject(obj) || isObservable(obj)) {
    return obj;
  }

  const Vue = getCurrentVue();
  let observed: T;
  if (Vue.observable) {
    observed = Vue.observable(obj);
  } else {
    const silent = Vue.config.silent;
    Vue.config.silent = true;
    const vm = new Vue({
      data: {
        $$state: obj,
      },
    });
    Vue.config.silent = silent;
    observed = vm._data.$$state;
  }

  def(observed, ObservableIdentifierKey, ObservableIdentifier);
  setupAccessControl(observed);
  return observed;
}
