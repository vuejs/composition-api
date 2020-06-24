# Vue Composition API

Vue 2 plugin for **Composition API** in Vue 3.

[![npm](https://img.shields.io/npm/v/@vue/composition-api)](https://www.npmjs.com/package/@vue/composition-api)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/vuejs/composition-api/Build%20&%20Test)](https://github.com/vuejs/composition-api/actions?query=workflow%3A%22Build+%26+Test%22)

English | [**中文文档**](./README.zh-CN.md) / [**Composition API RFC**](https://composition-api.vuejs.org/)


**Note: the primary goal of this package is to allow the community to experiment with the API and provide feedback before it's finalized. The implementation may contain minor inconsistencies with the RFC as the latter gets updated. We do not recommend using this package for production yet at this stage.**

---

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
<script src="https://cdn.jsdelivr.net/npm/@vue/composition-api@0.6.7"></script>
```
<!--cdn-links-end-->

`@vue/composition-api` will be exposed to global variable `window.vueCompositionApi`. 

```ts
const { ref, reactive } = vueCompositionApi
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

# Limitations

## `Ref` Unwrap

`Unwrap` is not working with Array index.

### **Should not** store `ref` as a **direct** child of `Array`:

```js
const state = reactive({
  list: [ref(0)],
});
// no unwrap, `.value` is required
state.list[0].value === 0; // true

state.list.push(ref(1));
// no unwrap, `.value` is required
state.list[1].value === 1; // true
```

### **Should not** use `ref` in a plain object when working with `Array`:

```js
const a = {
  count: ref(0),
};
const b = reactive({
  list: [a], // `a.count` will not unwrap!!
});

// no unwrap for `count`, `.value` is required
b.list[0].count.value === 0; // true
```

```js
const b = reactive({
  list: [
    {
      count: ref(0), // no unwrap!!
    },
  ],
});

// no unwrap for `count`, `.value` is required
b.list[0].count.value === 0; // true
```

### **Should** always use `ref` in a `reactive` when working with `Array`:

```js
const a = reactive({
  count: ref(0),
});
const b = reactive({
  list: [a],
});
// unwrapped
b.list[0].count === 0; // true

b.list.push(
  reactive({
    count: ref(1),
  })
);
// unwrapped
b.list[1].count === 1; // true
```

### ***Using*** `reactive` will mutate the origin object

This is an limitation of using `Vue.observable` in Vue 2.
> Vue 3 will return an new proxy object.

---

## `watch()` API

`onTrack` and `onTrigger` are not available in `WatchOptions`.

---

## Template Refs

> :white_check_mark:
> Support &nbsp;&nbsp;&nbsp;&nbsp;:x: Not Supported

:white_check_mark:
String ref && return it from `setup()`:

```html
<template>
  <div ref="root"></div>
</template>

<script>
  export default {
    setup() {
      const root = ref(null);

      onMounted(() => {
        // the DOM element will be assigned to the ref after initial render
        console.log(root.value); // <div/>
      });

      return {
        root,
      };
    },
  };
</script>
```

:white_check_mark:
String ref && return it from `setup()` && Render Function / JSX:

```jsx
export default {
  setup() {
    const root = ref(null);

    onMounted(() => {
      // the DOM element will be assigned to the ref after initial render
      console.log(root.value); // <div/>
    });

    return {
      root,
    };
  },
  render() {
    // with JSX
    return () => <div ref="root" />;
  },
};
```

:x: Function ref:

```html
<template>
  <div :ref="el => root = el"></div>
</template>

<script>
  export default {
    setup() {
      const root = ref(null);

      return {
        root,
      };
    },
  };
</script>
```

:x: Render Function / JSX in `setup()`:

```jsx
export default {
  setup() {
    const root = ref(null);

    return () =>
      h('div', {
        ref: root,
      });

    // with JSX
    return () => <div ref={root} />;
  },
};
```

If you really want to use template refs in this case, you can access `vm.$refs` via `SetupContext.refs`.

> :warning: **Warning**: The `SetupContext.refs` won't exist in `Vue 3.0`. `@vue/composition-api` provide it as a workaround here.

```js
export default {
  setup(initProps, setupContext) {
    const refs = setupContext.refs;
    onMounted(() => {
      // the DOM element will be assigned to the ref after initial render
      console.log(refs.root); // <div/>
    });

    return () =>
      h('div', {
        ref: 'root',
      });

    // with JSX
    return () => <div ref="root" />;
  },
};
```

You may also need to augment the `SetupContext` when working with TypeScript:

```ts
import Vue from 'vue';

declare module '@vue/composition-api' {
  interface SetupContext {
    readonly refs: { [key: string]: Vue | Element | Vue[] | Element[] };
  }
}
```

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
import { onServerPrefetch } from '@vue/composition-api';

export default {
  setup (props, { ssrContext }) {
    const result = ref();

    onServerPrefetch(async () => {
      result.value = await callApi(ssrContext.someId);
    });

    return {
      result,
    };
  },
};
```
