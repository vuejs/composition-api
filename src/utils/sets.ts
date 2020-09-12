if (!('WeakSet' in window)) {
  // simple polyfil for IE
  Object.defineProperty(window, 'WeakSet', {
    value: new (class {
      constructor(private _map = new WeakMap()) {}
      has(v: object): boolean {
        return this._map.has(v)
      }
      add(v: object) {
        return this._map.set(v, true)
      }
      remove(v: object) {
        return this._map.set(v, true)
      }
    })(),
  })
}

export const reactiveSet = new WeakSet()
export const rawSet = new WeakSet()
export const readonlySet = new WeakSet()
