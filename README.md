# @vue/composition-api

Vue 2 plugin for **Composition API**

[![npm](https://img.shields.io/npm/v/@vue/composition-api)](https://www.npmjs.com/package/@vue/composition-api)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/vuejs/composition-api/Build%20&%20Test)](https://github.com/vuejs/composition-api/actions?query=workflow%3A%22Build+%26+Test%22)

English | [中文](./README.zh-CN.md) · [**Composition API Docs**](https://composition-api.vuejs.org/)

## Installation

### NPM

```bash
npm install @vue/composition-api
# or
yarn add @vue/composition-api
```

You must install `@vue/composition-api` as a plugin via `Vue.use()` before you can use the [Composition API](https://composition-api.vuejs.org/) to compose your component.

```js
import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'

Vue.use(VueCompositionAPI)
```

```js
// use the APIs
import { ref, reactive } from '@vue/composition-api'
```

> :bulb: When you migrate to Vue 3, just replacing `@vue/composition-api` to `vue` and your code should just work.

### CDN

Include `@vue/composition-api` after Vue and it will install itself automatically.

<!--cdn-links-start-->
```html
<script src="https://cdn.jsdelivr.net/npm/vue@2.6"></script>
<script src="https://cdn.jsdelivr.net/npm/@vue/composition-api@0.6.5"></script>
```
<!--cdn-links-end-->

`@vue/composition-api` will be exposed to global variable `window.VueCompositionAPI`. 

```ts
const { ref, reactive } = VueCompositionAPI
```


## TypeScript Support

> TypeScript version **>3.5.1** is required

To let TypeScript properly infer types inside Vue component options, you need to define components with `defineComponent`

```ts
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  // type inference enabled
})
```

### JSX/TSX

To make JSX/TSX work with `@vue/composition-api`, check out [babel-preset-vca-jsx](https://github.com/luwanquan/babel-preset-vca-jsx) by [@luwanquan](https://github.com/luwanquan).

## Limitations

> :white_check_mark:
> Support &nbsp;&nbsp;&nbsp;&nbsp;:x: Not Supported

### Performance Impact

Due the the limitation of Vue2's public API. `@vue/composition-api` inevitably introduced some extract costs.

You can check the [benchmark results](https://antfu.github.io/vue-composition-api-benchmark-results/) for more details.


### `Ref` Unwrap

:x: `Unwrap` is not working with Array index.

#### **Should NOT** store `ref` as a **direct** child of `Array`:

```js
const state = reactive({
  list: [ref(0)],
})
// no unwrap, `.value` is required
state.list[0].value === 0 // true

state.list.push(ref(1))
// no unwrap, `.value` is required
state.list[1].value === 1 // true
```

#### **Should NOT** use `ref` in a plain object when working with `Array`:

```js
const a = {
  count: ref(0),
}
const b = reactive({
  list: [a], // `a.count` will not unwrap!!
})

// no unwrap for `count`, `.value` is required
b.list[0].count.value === 0 // true
```

```js
const b = reactive({
  list: [
    {
      count: ref(0), // no unwrap!!
    },
  ],
})

// no unwrap for `count`, `.value` is required
b.list[0].count.value === 0 // true
```

#### **Should** always use `ref` in a `reactive` when working with `Array`:

```js
const a = reactive({
  count: ref(0),
})
const b = reactive({
  list: [a],
})
// unwrapped
b.list[0].count === 0 // true

b.list.push(
  reactive({
    count: ref(1),
  })
)
// unwrapped
b.list[1].count === 1 // true
```

### :warning: `reactive` ***mutates*** the original object

`reactive` uses `Vue.observable` underneath which will ***mutate*** the original object.

> :bulb: Vue 3 will return an new proxy object.


### `watch()` API

:x: `onTrack` and `onTrigger` are not available in `WatchOptions`.

### Template Refs

:white_check_mark:
String ref && return it from `setup()`:

```html
<template>
  <div ref="root"></div>
</template>

<script>
  export default {
    setup() {
      const root = ref(null)

      onMounted(() => {
        // the DOM element will be assigned to the ref after initial render
        console.log(root.value) // <div/>
      })

      return {
        root,
      }
    },
  }
</script>
```

:white_check_mark:
String ref && return it from `setup()` && Render Function / JSX:

```jsx
export default {
  setup() {
    const root = ref(null)

    onMounted(() => {
      // the DOM element will be assigned to the ref after initial render
      console.log(root.value) // <div/>
    })

    return {
      root,
    }
  },
  render() {
    // with JSX
    return () => <div ref="root" />
  },
}
```

:x: Function ref:

```html
<template>
  <div :ref="el => root = el"></div>
</template>

<script>
  export default {
    setup() {
      const root = ref(null)

      return {
        root,
      }
    },
  }
</script>
```

:x: Render Function / JSX in `setup()`:

```jsx
export default {
  setup() {
    const root = ref(null)

    return () =>
      h('div', {
        ref: root,
      })

    // with JSX
    return () => <div ref={root} />
  },
}
```

<details>
<summary><code>$refs</code> accessing workaround
</summary>

<br>

> :warning: **Warning**: The `SetupContext.refs` won't exist in `Vue 3.0`. `@vue/composition-api` provide it as a workaround here.

If you really want to use template refs in this case, you can access `vm.$refs` via `SetupContext.refs`.


```jsx
export default {
  setup(initProps, setupContext) {
    const refs = setupContext.refs
    onMounted(() => {
      // the DOM element will be assigned to the ref after initial render
      console.log(refs.root) // <div/>
    })

    return () =>
      h('div', {
        ref: 'root',
      })

    // with JSX
    return () => <div ref="root" />
  },
}
```

You may also need to augment the `SetupContext` when working with TypeScript:

```ts
import Vue from 'vue'

declare module '@vue/composition-api' {
  interface SetupContext {
    readonly refs: { [key: string]: Vue | Element | Vue[] | Element[] }
  }
}
```

</details>


### :x: Reactive APIs in `data()`

Passing `ref`, `reactive` or other reactive apis to `data()` would not work.

```jsx
export default {
  data() {
    return {
      // will result { a: { value: 1 } } in template
      a: ref(1) 
    }
  },
};
```

## SSR

Even if there is no definitive Vue 3 API for SSR yet, this plugin implements the `onServerPrefetch` lifecycle hook that allows you to use the `serverPrefetch` hook found in the classic API.

```js
import { onServerPrefetch } from '@vue/composition-api'

export default {
  setup (props, { ssrContext }) {
    const result = ref()

    onServerPrefetch(async () => {
      result.value = await callApi(ssrContext.someId)
    })

    return {
      result,
    }
  },
}
```
