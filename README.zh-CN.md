# Vue Composition API

> [Vue Composition API](https://vue-composition-api-rfc.netlify.com/)

`@vue/composition-api` 使开发者们可以在 `Vue 2.x` 中使用 `Vue 3.0` 引入的**基于函数**的**逻辑复用机制**。

[**English Version**](./README.md)

---

# 导航

- [安装](#安装)
- [使用](#使用)
- [TypeScript](#TypeScript)
  - [TSX](#tsx)
- [限制](#限制)
- [API](https://vue-composition-api-rfc.netlify.com/api.html)
- [更新日志](https://github.com/vuejs/composition-api/blob/master/CHANGELOG.md)

# 安装

**npm**

```bash
npm install @vue/composition-api --save
```

**yarn**

```bash
yarn add @vue/composition-api
```

**CDN**

```html
<script src="https://unpkg.com/@vue/composition-api/dist/vue-composition-api.umd.js"></script>
```

通过全局变量 `window.vueCompositionApi` 来使用。

# 使用

在使用任何 `@vue/composition-api` 提供的能力前，必须先通过 `Vue.use()` 进行安装:

```js
import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';

Vue.use(VueCompositionApi);
```

安装插件后，您就可以使用新的 [Composition API](https://vue-composition-api-rfc.netlify.com/) 来开发组件了。

# TypeScript

**本插件要求使用 TypeScript 3.5.1 以上版本，如果你正在使用 `vetur`，请将 `vetur.useWorkspaceDependencies` 设为 `true`。**

为了让 TypeScript 在 Vue 组件选项中正确地推导类型，我们必须使用 `defineComponent` 来定义组件:

```ts
import { defineComponent } from '@vue/composition-api';

const Component = defineComponent({
  // 启用类型推断
});

const Component = {
  // 无法进行选项的类型推断
  // TypeScript 无法知道这是一个 Vue 组件的选项对象
};
```

## TSX

:rocket: 这里有一个配置好 TS/TSX 支持的[示例仓库](https://github.com/liximomo/vue-composition-api-tsx-example)来帮助你快速开始.

要支持 TSX，请创建一个类型定义文件并提供正确的 JSX 定义。内容如下：

```ts
// 文件: `shim-tsx.d.ts`
import Vue, { VNode } from 'vue';
import { ComponentRenderProxy } from '@vue/composition-api';

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends ComponentRenderProxy {}
    interface ElementAttributesProperty {
      $props: any; // 定义要使用的属性名称
    }
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}
```

# 限制

## `Ref` 自动展开 (unwrap)

数组索引属性无法进行自动展开:

### **不要**使用 `Array` 直接存取 `ref` 对象:

```js
const state = reactive({
  list: [ref(0)],
});
// 不会自动展开, 须使用 `.value`
state.list[0].value === 0; // true

state.list.push(ref(1));
// 不会自动展开, 须使用 `.value`
state.list[1].value === 1; // true
```

### **不要**在数组中使用含有 `ref` 的普通对象:

```js
const a = {
  count: ref(0),
};
const b = reactive({
  list: [a], // `a.count` 不会自动展开!!
});

// `count` 不会自动展开, 须使用 `.value`
b.list[0].count.value === 0; // true
```

```js
const b = reactive({
  list: [
    {
      count: ref(0), // 不会自动展开!!
    },
  ],
});

// `count` 不会自动展开, 须使用 `.value`
b.list[0].count.value === 0; // true
```

### **应该**总是将 `ref` 存放到 `reactive` 对象中:

```js
const a = reactive({
  count: ref(0),
});
const b = reactive({
  list: [a],
});
// 自动展开
b.list[0].count === 0; // true

b.list.push(
  reactive({
    count: ref(1),
  })
);
// 自动展开
b.list[1].count === 1; // true
```

### `reactive` 会返回一个修改过的原始的对象

此行为与 Vue 2 中的 `Vue.observable` 一致
> Vue 3 中会返回一个新的的代理对象.

---

## `watch()` API

不支持 `onTrack` 和 `onTrigger` 选项。

---

## 模板 Refs

> :white_check_mark: 支持 &nbsp;&nbsp;&nbsp;&nbsp;:x: 不支持

:white_check_mark: 字符串 ref && 从 `setup()` 返回 ref:

```html
<template>
  <div ref="root"></div>
</template>

<script>
  export default {
    setup() {
      const root = ref(null);

      onMounted(() => {
        // 在初次渲染后 DOM 元素会被赋值给 ref
        console.log(root.value); // <div/>
      });

      return {
        root,
      };
    },
  };
</script>
```

:white_check_mark: 字符串 ref && 从 `setup()` 返回 ref && 渲染函数 / JSX:

```jsx
export default {
  setup() {
    const root = ref(null);

    onMounted(() => {
      // 在初次渲染后 DOM 元素会被赋值给 ref
      console.log(root.value); // <div/>
    });

    return {
      root,
    };
  },
  render() {
    // 使用 JSX
    return () => <div ref="root" />;
  },
};
```

:x: 函数 ref:

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

:x: 渲染函数 / JSX:

```jsx
export default {
  setup() {
    const root = ref(null);

    return () =>
      h('div', {
        ref: root,
      });

    // 使用 JSX
    return () => <div ref={root} />;
  },
};
```

如果你依然选择在 `setup()` 中写 `render` 函数，那么你可以使用 `SetupContext.refs` 来访问模板引用，它等价于 Vue 2.x 中的 `this.$refs`:

> :warning: **警告**: `SetupContext.refs` 并不属于 `Vue 3.0` 的一部分, `@vue/composition-api` 将其曝光在 `SetupContext` 中只是临时提供一种变通方案。

```js
export default {
  setup(initProps, setupContext) {
    const refs = setupContext.refs;
    onMounted(() => {
      // 在初次渲染后 DOM 元素会被赋值给 ref
      console.log(refs.root); // <div/>
    });

    return () =>
      h('div', {
        ref: 'root',
      });

    // 使用 JSX
    return () => <div ref="root" />;
  },
};
```

如果项目使用了 TypeScript，你还需要扩展 `SetupContext` 类型:

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
