import { VueConstructor } from 'vue';

declare global {
  interface Window {
    Vue: VueConstructor;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    readonly _data: Record<string, any>;
  }

  interface VueConstructor {
    observable<T>(x: any): T;
    util: {
      warn(msg: string, vm?: Vue);
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
