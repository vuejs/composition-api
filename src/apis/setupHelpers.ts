import { getCurrentInstance, SetupContext } from '../runtimeContext'
import { warn } from '../utils'

export function useSlots(): SetupContext['slots'] {
  return getContext().slots
}

export function useAttrs(): SetupContext['attrs'] {
  return getContext().attrs
}

function getContext(): SetupContext {
  const i = getCurrentInstance()!
  if (__DEV__ && !i) {
    warn(`useContext() called without active instance.`)
  }
  return i.setupContext!
}
