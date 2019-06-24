import Vue from 'vue';
import { getCurrentVue } from '../runtimeContext';
import { proxy, hasOwn } from '../utils';

export default abstract class AbstractWrapper<V> {
  protected _propName?: string;
  protected _vm?: Vue;
  abstract value: V;

  setVmProperty(vm: Vue, propName: string) {
    this._vm = vm;
    this._propName = propName;

    const props = vm.$options.props;
    const methods = vm.$options.methods;
    const computed = vm.$options.computed;
    const warn = getCurrentVue().util.warn;
    if (!(propName in vm)) {
      proxy(
        vm,
        propName,
        () => this.value,
        (val: any) => {
          this.value = val;
        }
      );
      if (process.env.NODE_ENV !== 'production') {
        this.exposeToDevltool();
      }
    } else if (process.env.NODE_ENV !== 'production') {
      if (hasOwn(vm.$data, propName)) {
        warn(`The setup binding property "${propName}" is already declared as a data.`, vm);
      } else if (props && hasOwn(props, propName)) {
        warn(`The setup binding property "${propName}" is already declared as a prop.`, vm);
      } else if (methods && hasOwn(methods, propName)) {
        warn(`The setup binding property "${propName}" is already declared as a method.`, vm);
      } else if (computed && propName in computed) {
        warn(`The setup binding property "${propName}" is already declared as a computed.`, vm);
      } else {
        warn(`The setup binding property "${propName}" is already declared.`, vm);
      }
    }
  }

  protected abstract exposeToDevltool(): void;
}
