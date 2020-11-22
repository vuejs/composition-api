import { readonly } from './index'

describe('should support DeepReadonly', () => {
  const r = readonly({ obj: { k: 'v' } })
  // @ts-expect-error
  r.obj = {}
  // @ts-expect-error
  r.obj.k = 'x'
})
