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

You must install `@vue/composition-api` via `Vue.use()` before you can use the [Composition API](https://composition-api.vuejs.org/) to compose your component.

```js
import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'

Vue.use(VueCompositionApi)
```

```js
// in components
import { ref, reactive } from '@vue/composition-api'
```

### CDN

```html
<script src="https://unpkg.com/@vue/composition-api/dist/vue-composition-api.umd.js"></script>
```

The package will be exposed to global variable `window.vueCompositionApi`

```js
// install the plugin
Vue.use(vueCompositionApi.default)
```

```js
// use the APIs
const { ref, reactive } = vueCompositionApi
```


## TypeScript Support

> TypeScript version **>3.5.1** is required

To let TypeScript properly infer types inside Vue component options, you need to define components with `defineComponent`

```ts
import { defineComponent } from '@vue/composition-api'

const ComponentA = defineComponent({
  // type inference enabled
})

const ComponentB = {
  // this will NOT have type inference,
  // because TypeScript can't tell this is options for a Vue component.
}
```

### TSX

:rocket: An Example [Repository](https://github.com/liximomo/vue-composition-api-tsx-example) with TS and TSX support is provided to help you start.

To support TSX, create a declaration file with following content in your project.

```ts
// file: shim-tsx.d.ts
import Vue, { VNode } from 'vue'
import { ComponentRenderProxy } from '@vue/composition-api'

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends ComponentRenderProxy {}
    interface ElementAttributesProperty {
      $props: any // specify the property name to use
    }
    interface IntrinsicElements {
      [elem: string]: any
    }
  }
}
```

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

If you really want to use template refs in this case, you can access `vm.$refs` via `SetupContext.refs`.

> :warning: **Warning**: The `SetupContext.refs` won't exist in `Vue 3.0`. `@vue/composition-api` provide it as a workaround here.

```js
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
import VueCompositionApi from '@vue/composition-api'

Vue.use(VueCompositionApi)

declare module '@vue/composition-api' {
  interface SetupContext {
    readonly refs: { [key: string]: Vue | Element | Vue[] | Element[] }
  }
}
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
