import { AnyObject } from '../types/basic';
import { getCurrentVue } from '../runtimeContext';
import { isObject, def, hasOwn } from '../utils';
import { isWrapper } from '../wrappers';
import { ObservableIdentifierKey, AccessControIdentifierlKey } from '../symbols';

const AccessControlIdentifier = {};
const ObservableIdentifier = {};

function setupAccessControl(target: AnyObject) {
  if (!isObject(target)) {
    return;
  }
  if (hasOwn(target, AccessControIdentifierlKey) && target.__ac__ === AccessControlIdentifier) {
    return;
  }

  def(target, AccessControIdentifierlKey, AccessControlIdentifier);
  const keys = Object.keys(target);
  for (let i = 0; i < keys.length; i++) {
    defineAccessControl(target, keys[i]);
  }
}

function defineAccessControl(target: AnyObject, key: any) {
  const property = Object.getOwnPropertyDescriptor(target, key);
  if (!property) {
    return;
  }

  if (property.configurable === false) {
    return;
  }

  let rawVal = target[key];
  let isValueWrapper = isWrapper(rawVal);

  // we are sure that get and set exist.
  const getter = property.get!;
  const setter = property.set!;

  setupAccessControl(target[key]);
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get: function getterHandler() {
      if (isValueWrapper) {
        return rawVal.value;
      } else {
        return getter.call(target);
      }
    },
    set: function setterHandler(newVal) {
      if (isValueWrapper) {
        rawVal.value = newVal;
        setupAccessControl(newVal);
        return;
      }

      if (isWrapper(newVal)) {
        isValueWrapper = true;
        rawVal = newVal;
        // trigger observer
        setter.call(target, newVal);
        return;
      }

      setter.call(target, newVal);
      setupAccessControl(newVal);
    },
  });
}

export function observable<T = any>(obj: T): T {
  if (!isObject(obj)) {
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
