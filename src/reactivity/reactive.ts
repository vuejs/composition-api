import { AnyObject } from '../types/basic';
import { getCurrentVue } from '../runtimeContext';
import { isObject, def, hasOwn } from '../utils';
import { isComponentInstance, createComponentInstance } from '../helper';
import { AccessControIdentifierlKey, ObservableIdentifierKey } from '../symbols';
import { isRef, UnwrapValue } from './ref';

const AccessControlIdentifier = {};
const ObservableIdentifier = {};
/**
 * Proxing property access of target.
 * We can do unwrapping and other things here.
 */
function setupAccessControl(target: AnyObject) {
  if (!isObject(target) || Array.isArray(target) || isRef(target) || isComponentInstance(target)) {
    return;
  }

  if (
    hasOwn(target, AccessControIdentifierlKey) &&
    target[AccessControIdentifierlKey] === AccessControlIdentifier
  ) {
    return;
  }

  if (Object.isExtensible(target)) {
    def(target, AccessControIdentifierlKey, AccessControlIdentifier);
  }
  const keys = Object.keys(target);
  for (let i = 0; i < keys.length; i++) {
    defineAccessControl(target, keys[i]);
  }
}

export function isReactive(obj: any): boolean {
  return (
    hasOwn(obj, ObservableIdentifierKey) && obj[ObservableIdentifierKey] === ObservableIdentifier
  );
}

/**
 * Auto unwrapping when acccess property
 */
export function defineAccessControl(target: AnyObject, key: any, val?: any) {
  if (key === '__ob__') return;

  let getter: (() => any) | undefined;
  let setter: ((x: any) => void) | undefined;
  const property = Object.getOwnPropertyDescriptor(target, key);
  if (property) {
    if (property.configurable === false) {
      return;
    }
    getter = property.get;
    setter = property.set;
    if ((!getter || setter) /* not only have getter */ && arguments.length === 2) {
      val = target[key];
    }
  }

  setupAccessControl(val);
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get: function getterHandler() {
      const value = getter ? getter.call(target) : val;
      if (isRef(value)) {
        return value.value;
      } else {
        return value;
      }
    },
    set: function setterHandler(newVal) {
      if (getter && !setter) return;

      const value = getter ? getter.call(target) : val;
      if (isRef(value)) {
        if (isRef(newVal)) {
          val = newVal;
        } else {
          value.value = newVal;
        }
      } else if (setter) {
        setter.call(target, newVal);
      } else if (isRef(newVal)) {
        val = newVal;
      }
      setupAccessControl(newVal);
    },
  });
}

/**
 * Make obj reactivity
 */
export function reactive<T = any>(obj: T): UnwrapValue<T> {
  if (!isObject(obj) || isReactive(obj)) {
    return obj as UnwrapValue<T>;
  }

  const Vue = getCurrentVue();
  let observed: T;
  if (Vue.observable) {
    observed = Vue.observable(obj);
  } else {
    const vm = createComponentInstance(Vue, {
      data: {
        $$state: obj,
      },
    });
    observed = vm._data.$$state;
  }

  if (Object.isExtensible(observed)) {
    def(observed, ObservableIdentifierKey, ObservableIdentifier);
  }
  setupAccessControl(observed);
  return observed as UnwrapValue<T>;
}
