# 0.5.0

- New: `watchEffect` function, lingin up with the latest version of the RFC ([RFC docs](https://vue-composition-api-rfc.netlify.com/api.html#watcheffect)) (#275)
- Fix: `setup` from a mixin should called before the componen's own (#276)
- Fix(types): Fix corner case in `UnWrapRef` internal type (#261)
- types: Add `Element` to bailout types for unwrapping (#278)

# 0.4.0

- **Refactor: rename `createComponent` to `defineComponent`** (the `createComponent` function is still there but deprecated) [#230](https://github.com/vuejs/composition-api/issues/230)
- Fix: correct the symbol check; fixes the compatibility issue in iOS 9 [#218](https://github.com/vuejs/composition-api/pull/218)
- Fix: avoid accessing undeclared instance fields on type-level; fixes Vetur template type checking; fixes vue-router type compatibility [#189](https://github.com/vuejs/composition-api/pull/189)
- Fix: `onUnmounted` should not be run on `deactivated` [#217](https://github.com/vuejs/composition-api/pull/217)

# 0.3.4

- Fixed `reactive` setter not working on the server.
- New `isServer` setup context property.

# 0.3.3

- Fixed make `__ob__` unenumerable [#149](https://github.com/vuejs/composition-api/issues/149).
- Fixed computed type
- Expose `getCurrentInstance` for advanced usage in Vue plugins.
- New `onServerPrefetch` lifecycle hook and new `ssrContext` setup context property [#198](https://github.com/vuejs/composition-api/issues/198).

# 0.3.2

- Improve TypeScript type infer for `props` option [#106](https://github.com/vuejs/composition-api/issues/106).
- Fix return type of `createComponent` not being compatible with `vue-router` [#130](https://github.com/vuejs/composition-api/issues/130).
- Expose `listeners` on `SetupContext` [#132](https://github.com/vuejs/composition-api/issues/132).

# 0.3.1

- Fix cleaup callback not running when watcher stops [#113](https://github.com/vuejs/composition-api/issues/113).
- Fix watcher callback not flushing at right timing [#120](https://github.com/vuejs/composition-api/issues/120).

# 0.3.0

- Improve TypeScript type definitions.
- Fix `context.slots` not being avaliable before render [#84](https://github.com/vuejs/composition-api/issues/84).

## Changed

The `render` function returned from `setup` no longer receives any parameters.

### Previous

```js
export default {
  setup() {
    return props => h('div', prop.msg);
  },
};
```

### Now

```js
export default {
  setup(props) {
    return () => h('div', prop.msg);
  },
};
```

# 0.2.1

- Declare your expected prop types directly in TypeScript:

  ```js
  import { createComponent, createElement as h } from '@vue/composition-api';

  interface Props {
    msg: string;
  }

  const MyComponent =
    createComponent <
    Props >
    {
      props: {
        msg: {}, // required by vue 2 runtime
      },
      setup(props) {
        return () => h('div', props.msg);
      },
    };
  ```

- Declare ref type in TypeScript:
  ```js
  const dateRef = ref < Date > new Date();
  ```
- Fix `createComponent` not working with `import()` [#81](https://github.com/vuejs/composition-api/issues/81).
- Fix `inject` type declaration [#83](https://github.com/vuejs/composition-api/issues/83).

# 0.2.0

## Fixed

- `computed` property is called immediately in `reactive()` [#79](https://github.com/vuejs/composition-api/issues/79).

## Changed

- rename `onBeforeDestroy()` to `onBeforeUnmount()` [lifecycle-hooks](https://vue-composition-api-rfc.netlify.com/api.html#lifecycle-hooks).
- Remove `onCreated()` [lifecycle-hooks](https://vue-composition-api-rfc.netlify.com/api.html#lifecycle-hooks).
- Remove `onDestroyed()` [lifecycle-hooks](https://vue-composition-api-rfc.netlify.com/api.html#lifecycle-hooks).

# 0.1.0

**The package has been renamed to `@vue/composition-api` to be consistent with RFC.**

The `@vue/composition-api` reflects the [Composition API](https://vue-composition-api-rfc.netlify.com/) RFC.

# 2.2.0

- Improve typescript support.
- Export `createElement`.
- Export `SetupContext`.
- Support returning a render function from `setup`.
- Allow string keys in `provide`/`inject`.

# 2.1.2

- Remove auto-unwrapping for Array ([#53](https://github.com/vuejs/composition-api/issues/53)).

# 2.1.1

- Export `set()` function. Using exported `set` whenever you need to use [Vue.set](https://vuejs.org/v2/api/#Vue-set) or [vm.\$set](https://vuejs.org/v2/api/#vm-set). The custom `set` ensures that auto-unwrapping works for the new property.
- Add a new signature of `provide`: `provide(key, value)`.
- Fix multiple `provide` invoking per component.
- Fix order of `setup` invoking.
- `onErrorCaptured` not triggered ([#25](https://github.com/vuejs/composition-api/issues/25)).
- Fix `this` losing in nested setup call ([#38](https://github.com/vuejs/composition-api/issues/38)).
- Fix some edge cases of unwarpping.
- Change `context.slots`'s value. It now proxies to `$scopeSlots` instead of `$slots`.

# 2.0.6

## Fixed

- watch callback is called repeatedly with multi-sources

## Improved

- reduce `watch()` memory overhead

# 2.0.0

Implement the [newest version of RFC](https://github.com/vuejs/rfcs/blob/function-apis/active-rfcs/0000-function-api.md)

## Breaking Changes

`this` is not available inside `setup()`. See [setup](https://github.com/vuejs/rfcs/blob/function-apis/active-rfcs/0000-function-api.md#the-setup-function) for details.

## Features

Complex Prop Types:

```ts
import { createComponent, PropType } from 'vue';

createComponent({
  props: {
    options: (null as any) as PropType<{ msg: string }>,
  },
  setup(props) {
    props.options; // { msg: string } | undefined
  },
});
```

# 1.x

Implement the [init version of RFC](https://github.com/vuejs/rfcs/blob/903f429696524d8f93b4976d5b09dfb3632e89ef/active-rfcs/0000-function-api.md)
