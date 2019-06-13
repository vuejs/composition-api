import { VueConstructor } from 'vue';

declare global {
  interface Window {
    Vue: VueConstructor;
  }
}

declare module 'vue/types/vue' {
  interface VueConstructor {
    util: {
      warn(msg: string, vm: Vue);
      defineReactive(
        obj: Object,
        key: string,
        val: any,
        customSetter?: Function,
        shallow?: boolean
      );
    };
  }
}
