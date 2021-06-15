import { VueConstructor } from 'vue'
import { VfaState } from './utils/vmStateManager'
import { VueWatcher } from './apis/watch'

declare global {
  interface Window {
    Vue: VueConstructor
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    readonly _uid: number
    readonly _data: Record<string, any>
    _watchers: VueWatcher[]
    __composition_api_state__?: VfaState
  }
}
