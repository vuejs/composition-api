import { ComponentInstance, Data } from './component';

export interface VfaState {
  refs?: string[];
  rawBindings?: Data;
}

function set<K extends keyof VfaState>(vm: ComponentInstance, key: K, value: VfaState[K]): void {
  const state = (vm.__secret_vfa_state__ = vm.__secret_vfa_state__ || {});
  state[key] = value;
}

function get<K extends keyof VfaState>(vm: ComponentInstance, key: K): VfaState[K] | undefined {
  return (vm.__secret_vfa_state__ || {})[key];
}

export default {
  set,
  get,
};
