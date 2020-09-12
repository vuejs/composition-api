# @vue/composition-api

Vue 2 plugin for **Composition API**

[![npm](https://img.shields.io/npm/v/@vue/composition-api)](https://www.npmjs.com/package/@vue/composition-api)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/vuejs/composition-api/Build%20&%20Test)](https://github.com/vuejs/composition-api/actions?query=workflow%3A%22Build+%26+Test%22)
[![Minzipped size](https://badgen.net/bundlephobia/minzip/@vue/composition-api)](https://bundlephobia.com/result?p=@vue/composition-api)



English | [中文](./README.zh-CN.md) ・ [**Composition API Docs**](https://composition-api.vuejs.org/)

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
<script src="https://cdn.jsdelivr.net/npm/@vue/composition-api@1.0.0-beta.11"></script>
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

## SSR

Even if there is no definitive Vue 3 API for SSR yet, this plugin implements the `onServerPrefetch` lifecycle hook that allows you to use the `serverPrefetch` hook found in the classic API.

```js
import { onServerPrefetch } from '@vue/composition-api'

export default {
  setup(props, { ssrContext }) {
    const result = ref()

    onServerPrefetch(async () => {
      result.value = await callApi(ssrContext.someId)
    })

    return {
      result,
    }
  }
}
```

## Limitations

> :white_check_mark: Support &nbsp;&nbsp;&nbsp;&nbsp;:x: Not Supported

### `Ref` Unwrap

`Unwrap` is not working with Array index.

<details>
<summary>
❌ <b>Should NOT</b> store <code>ref</code> as a <b>direct</b> child of <code>Array</code>
</summary>

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

</details>

<details>
<summary>
❌ <b>Should NOT</b> use <code>ref</code> in a plain object when working with <code>Array</code>
</summary>

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

</details>

<details>
<summary>
⚠️ `set` workaround for adding new reactive properties
</summary>

> ⚠️ Warning: `set` does NOT exist in Vue 3. We provide it as a workaround here, due to the limitation of [Vue 2.x reactivity system](https://vuejs.org/v2/guide/reactivity.html#For-Objects). In Vue 2, you will need to call `set` to track new keys on an `object`(similar to `Vue.set` but for `reactive objects` created by the Composition API). In Vue 3, you can just assign them like normal objects.

```ts
import { reactive, set } from '@vue/composition-api'

const a = reactive({
  foo: 1
})

// add new reactive key
set(a, 'bar', 1)
```


</details>

### Template Refs

<details>
<summary>
✅ String ref && return it from <code>setup()</code>
</summary>

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

</details>

<details>
<summary>
✅ String ref && return it from <code>setup()</code> && Render Function / JSX
</summary>

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

</details>

<details>
<summary>
❌ Function ref
</summary>

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

</details>

<details>
<summary>
❌ Render Function / JSX in <code>setup()</code>
</summary>

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

</details>

<details>
<summary>
⚠️ <code>$refs</code> accessing workaround
</summary>

<br>

> :warning: **Warning**: The `SetupContext.refs` won't exist in `Vue 3.0`. `@vue/composition-api` provide it as a workaround here.

If you really want to use template refs in this case, you can access `vm.$refs` via `SetupContext.refs`

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

### Reactive

<details>
<summary>
⚠️ <code>reactive()</code> <b>mutates</b> the original object
</summary>

`reactive` uses `Vue.observable` underneath which will ***mutate*** the original object.

> :bulb: In Vue 3, it will return an new proxy object.

</details>

### Watch

<details>
<summary>
❌ <code>onTrack</code> and <code>onTrigger</code> are not available in <code>WatchOptions</code>
</summary>

```js
watch(() => {
    /* ... */
}, {
  immediate: true,
  onTrack() {}, // not available
  onTrigger() {}, // not available
})
```

</details>

### `createApp`

<details>
<summary>
⚠️ <code>createApp()</code> is global
</summary>

In Vue 3, `createApp()` is introduced to provide context(plugin, components, etc.) isolation between app instances. Due the the design of Vue 2, in this plugin, we provide `createApp()` as a forward compatible API which is just an alias of the global.

```ts
const app1 = createApp(RootComponent1)
app1.component('Foo', Foo) // equivalent to Vue.component('Foo', Foo)
app1.use(VueRouter) // equivalent to Vue.use(VueRouter)

const app2 = createApp(RootComponent2)
app2.component('Bar', Bar) // equivalent to Vue.use('Bar', Bar)
```

</details>

### `shallowReadonly`

<details>
<summary>
⚠️ <code>shallowReadonly()</code> will create a new object and with the same root properties, new properties added will <b>not</b> be readonly or reactive.
</summary>

> :bulb: In Vue 3, it will return an new proxy object.

</details>

### `props`
<details>
<summary>
⚠️ <code>toRefs(props.foo.bar)</code> will incorrectly warn when acessing nested levels of props.
⚠️ <code>isReactive(props.foo.bar)</code> will return false.
</summary>
  
```ts
defineComponent({
  setup(props) {
    const { bar } = toRefs(props.foo) // it will `warn`
    
    // use this instead 
    const { foo } = toRefs(props)
    const a = foo.value.bar
  }
})
```

</details>



### Missing APIs

The following APIs introduced in Vue 3 are not available in this plugin.

- `readonly`
- `defineAsyncComponent`
- `onRenderTracked`
- `onRenderTriggered`
- `isProxy`

### Reactive APIs in `data()`

<details>
<summary>
❌ Passing <code>ref</code>, <code>reactive</code> or other reactive apis to <code>data()</code> would not work.
</summary>

```jsx
export default {
  data() {
    return {
      // will result { a: { value: 1 } } in template
      a: ref(1),
    }
  },
}
```

</details>

### Performance Impact

Due the the limitation of Vue2's public API. `@vue/composition-api` inevitably introduced some extract costs. It shouldn't bother you unless in extreme environments.

You can check the [benchmark results](https://antfu.github.io/vue-composition-api-benchmark-results/) for more details.
