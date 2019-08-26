import { VueConstructor } from 'vue';
import { VfaState } from './vmStateManager';

declare global {
  interface Window {
    Vue: VueConstructor;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    readonly _uid: number;
    readonly _data: Record<string, any>;
    __secret_vfa_state__?: VfaState;
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
