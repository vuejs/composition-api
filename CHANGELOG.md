# 0.2.0
## Fixed
* `computed` property is called immediately in `reactive()` [#79](https://github.com/vuejs/composition-api/issues/79).

## Changed
* rename `onBeforeDestroy()` to `onBeforeUnmount()` [lifecycle-hooks](https://vue-composition-api-rfc.netlify.com/api.html#lifecycle-hooks).
* Remove `onCreated()` [lifecycle-hooks](https://vue-composition-api-rfc.netlify.com/api.html#lifecycle-hooks).
* Remove `onDestroyed()` [lifecycle-hooks](https://vue-composition-api-rfc.netlify.com/api.html#lifecycle-hooks).

# 0.1.0
**The package has been renamed to `@vue/composition-api` to be consistent with RFC.**

The `@vue/composition-api` reflects the [Composition API](https://vue-composition-api-rfc.netlify.com/) RFC.

# 2.2.0
* Improve typescript support.
* Export `createElement`.
* Export `SetupContext`.
* Support returning a render function from `setup`.
* Allow string keys in `provide`/`inject`.

# 2.1.2
* Remove auto-unwrapping for Array ([#53](https://github.com/vuejs/composition-api/issues/53)).

# 2.1.1
* Export `set()` function. Using exported `set` whenever you need to use [Vue.set](https://vuejs.org/v2/api/#Vue-set) or [vm.$set](https://vuejs.org/v2/api/#vm-set). The custom `set` ensures that auto-unwrapping works for the new property.
* Add a new signature of `provide`: `provide(key, value)`.
* Fix multiple `provide` invoking per component.
* Fix order of `setup` invoking.
* `onErrorCaptured` not triggered ([#25](https://github.com/vuejs/composition-api/issues/25)).
* Fix `this` losing in nested setup call ([#38](https://github.com/vuejs/composition-api/issues/38)).
* Fix some edge cases of unwarpping.
* Change `context.slots`'s value. It now proxies to `$scopeSlots` instead of `$slots`.

# 2.0.6
## Fixed
* watch callback is called repeatedly with multi-sources

## Improved
* reduce `watch()` memory overhead

# 2.0.0
Implement the [newest version of RFC](https://github.com/vuejs/rfcs/blob/function-apis/active-rfcs/0000-function-api.md)

## Breaking Changes
`this` is not available inside `setup()`. See [setup](https://github.com/vuejs/rfcs/blob/function-apis/active-rfcs/0000-function-api.md#the-setup-function) for details.

## Features
Complex Prop Types:

```ts
import { createComponent, PropType } from 'vue'

createComponent({
  props: {
    options: (null as any) as PropType<{ msg: string }>
  },
  setup(props) {
    props.options // { msg: string } | undefined
  }
})
```

# 1.x
  Implement the [init version of RFC](https://github.com/vuejs/rfcs/blob/903f429696524d8f93b4976d5b09dfb3632e89ef/active-rfcs/0000-function-api.md)
