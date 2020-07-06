import { getCurrentInstance } from '../runtimeContext'
import { warn } from '../utils'

const EMPTY_OBJ: { readonly [key: string]: string } = __DEV__
  ? Object.freeze({})
  : {}

export const useCSSModule = (name = '$style'): Record<string, string> => {
  const instance = getCurrentInstance()
  if (!instance) {
    __DEV__ && warn(`useCSSModule must be called inside setup()`)
    return EMPTY_OBJ
  }

  const mod = (instance as any)[name]
  if (!mod) {
    __DEV__ &&
      warn(`Current instance does not have CSS module named "${name}".`)
    return EMPTY_OBJ
  }

  return mod as Record<string, string>
}
