import Vue from 'vue';
import { proxy, hasOwn, def, warn } from '../utils';

export interface Wrapper<V> {
  value: V;
}

type Value<T> = Wrapper<T>;

type BailTypes = Function | Map<any, any> | Set<any> | WeakMap<any, any> | WeakSet<any>;

// prettier-ignore
// Recursively unwraps nested value bindings.
// Unfortunately TS cannot do recursive types, but this should be enough for
// practical use cases...
export type UnwrapValue<T> = T extends Value<infer V>
  ? UnwrapValue2<V>
  : T extends BailTypes
      ? T // bail out on types that shouldn't be unwrapped
      : T extends object ? { [K in keyof T]: UnwrapValue2<T[K]> } : T

// prettier-ignore
type UnwrapValue2<T> = T extends Value<infer V>
  ? UnwrapValue3<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue3<T[K]> } : T

// prettier-ignore
type UnwrapValue3<T> = T extends Value<infer V>
  ? UnwrapValue4<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue4<T[K]> } : T

// prettier-ignore
type UnwrapValue4<T> = T extends Value<infer V>
  ? UnwrapValue5<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue5<T[K]> } : T

// prettier-ignore
type UnwrapValue5<T> = T extends Value<infer V>
  ? UnwrapValue6<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue6<T[K]> } : T

// prettier-ignore
type UnwrapValue6<T> = T extends Value<infer V>
  ? UnwrapValue7<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue7<T[K]> } : T

// prettier-ignore
type UnwrapValue7<T> = T extends Value<infer V>
  ? UnwrapValue8<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue8<T[K]> } : T

// prettier-ignore
type UnwrapValue8<T> = T extends Value<infer V>
  ? UnwrapValue9<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue9<T[K]> } : T

// prettier-ignore
type UnwrapValue9<T> = T extends Value<infer V>
  ? UnwrapValue10<V>
  : T extends BailTypes
      ? T
      : T extends object ? { [K in keyof T]: UnwrapValue10<T[K]> } : T

// prettier-ignore
type UnwrapValue10<T> = T extends Value<infer V>
  ? V // stop recursion
  : T

export default abstract class AbstractWrapper<V> {
  protected _propName?: string;
  protected _vm?: Vue;
  abstract value: V;

  setVmProperty(vm: Vue, propName: string) {
    def(this, '_vm', vm);
    def(this, '_propName', propName);

    const props = vm.$options.props;
    if (!(propName in vm) && !(props && hasOwn(props, propName))) {
      proxy(vm, propName, {
        get: () => this.value,
        set: (val: any) => {
          this.value = val;
        },
      });
      if (process.env.NODE_ENV !== 'production') {
        // expose bindings after state has been resolved to prevent repeated works
        vm.$nextTick(() => {
          this.exposeToDevtool();
        });
      }
    } else if (process.env.NODE_ENV !== 'production') {
      if (props && hasOwn(props, propName)) {
        warn(`The setup binding property "${propName}" is already declared as a prop.`, vm);
      } else {
        warn(`The setup binding property "${propName}" is already declared.`, vm);
      }
    }
  }

  protected abstract exposeToDevtool(): void;
}
