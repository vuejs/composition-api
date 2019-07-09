import Vue from 'vue';
import { getCurrentVue } from '../runtimeContext';
import { proxy, hasOwn, def } from '../utils';

export default abstract class AbstractWrapper<V> {
  protected _propName?: string;
  protected _vm?: Vue;
  abstract value: V;

  setVmProperty(vm: Vue, propName: string) {
    def(this, '_vm', vm);
    def(this, '_propName', propName);

    const props = vm.$options.props;
    const warn = getCurrentVue().util.warn;
    if (!(propName in vm) && !(props && hasOwn(props, propName))) {
      proxy(vm, propName, {
        get: () => this.value,
        set: (val: any) => {
          this.value = val;
        },
      });
      if (process.env.NODE_ENV !== 'production') {
        // after data has resolved, expose bindings to vm._data.
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
