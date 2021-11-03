import { ComponentInstance, Data } from '../component'
import { SetupContext } from '../runtimeContext'

export interface VfaState {
  refs?: string[]
  rawBindings?: Data
  attrBindings?: {
    ctx: SetupContext
    data: Data
  }
  slots?: string[]
}

function set<K extends keyof VfaState>(
  vm: ComponentInstance,
  key: K,
  value: VfaState[K]
): void {
  const state = (vm.__composition_api_state__ =
    vm.__composition_api_state__ || {})
  state[key] = value
}

function get<K extends keyof VfaState>(
  vm: ComponentInstance,
  key: K
): VfaState[K] | undefined {
  return (vm.__composition_api_state__ || {})[key]
}

export default {
  set,
  get,
}
