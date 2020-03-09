# Vue Composition API

> [Vue Composition API](https://vue-composition-api-rfc.netlify.com/)

`@vue/composition-api` provides a way to use `Vue 3.0`'s **Composition api** in `Vue 2.x`.

**Note: the primary goal of this package is to allow the community to experiment with the API and provide feedback before it's finalized. The implementation may contain minor inconsistencies with the RFC as the latter gets updated. We do not recommend using this package for production yet at this stage.**

[**中文文档**](./README.zh-CN.md)

---

# Navigation

- [Installation](#Installation)
- [Usage](#Usage)
- [TypeScript](#TypeScript)
  - [TSX](#tsx)
- [Limitations](#Limitations)
- [API](https://vue-composition-api-rfc.netlify.com/api.html)
- [Changelog](https://github.com/vuejs/composition-api/blob/master/CHANGELOG.md)

# Installation

**npm**

```bash
npm install @vue/composition-api
```

**yarn**

```bash
yarn add @vue/composition-api
```

**CDN**

```html
<script src="https://unpkg.com/@vue/composition-api/dist/vue-composition-api.umd.js"></script>
```

By using the global variable `window.vueCompositionApi`

# Usage

You must install `@vue/composition-api` via `Vue.use()` before using other APIs:

```js
import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';

Vue.use(VueCompositionApi);
```

After installing the plugin you can use the [Composition API](https://vue-composition-api-rfc.netlify.com/) to compose your component.

# TypeScript

**This plugin requires TypeScript version >3.5.1. If you are using vetur, make sure to set `vetur.useWorkspaceDependencies` to `true`.**

To let TypeScript properly infer types inside Vue component options, you need to define components with `defineComponent`:

```ts
import { defineComponent } from '@vue/composition-api';

const Component = defineComponent({
  // type inference enabled
});

const Component = {
  // this will NOT have type inference,
  // because TypeScript can't tell this is options for a Vue component.
};
```

## TSX

:rocket: An Example [Repository](https://github.com/liximomo/vue-composition-api-tsx-example) with TS and TSX support is provided to help you start.

To support TSX, create a declaration file with following content in your project.

```ts
// file: shim-tsx.d.ts
import Vue, { VNode } from 'vue';
import { ComponentRenderProxy } from '@vue/composition-api';

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends ComponentRenderProxy {}
    interface ElementAttributesProperty {
      $props: any; // specify the property name to use
    }
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}
```

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
import VueCompositionApi from '@vue/composition-api';

Vue.use(VueCompositionApi);

declare module '@vue/composition-api/dist/component/component' {
  interface SetupContext {
    readonly refs: { [key: string]: Vue | Element | Vue[] | Element[] };
  }
}
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
