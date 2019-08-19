# Vue Function API

> [Vue Composition API](https://vue-composition-api-rfc.netlify.com/)

`vue-function-api` 使开发者们可以在 `Vue2.x` 中使用 `Vue3` 引入的**基于函数**的**逻辑复用机制**。

[**English Version**](./README.md)

---

# 导航

- [安装](#安装)
- [使用](#使用)
- [TypeScript](#TypeScript)
- [限制](#限制)
- [API](https://vue-composition-api-rfc.netlify.com/api.html)
- [Changelog](https://github.com/vuejs/vue-function-api/blob/master/CHANGELOG.md)

# 安装

**npm**

```bash
npm install vue-function-api --save
```

**yarn**

```bash
yarn add vue-function-api
```

**CDN**

```html
<script src="https://unpkg.com/vue-function-api/dist/vue-function-api.umd.js"></script>
```

通过全局变量 `window.vueFunctionApi` 来使用。

# 使用

您必须显式地通过 `Vue.use()` 来安装 `vue-function-api`:

```js
import Vue from 'vue';
import { plugin } from 'vue-function-api';

Vue.use(plugin);
```

安装插件后，您就可以使用新的[Composition API](https://vue-composition-api-rfc.netlify.com/)来开发组件了。

# TypeScript

为了让 TypeScript 正确的推到类型，我们必须使用 `createComponent` 来定义组件:

```ts
import Vue from 'vue';

const Component = createComponent({
  // 启用类型推断
});

const Component = {
  // 无法进行选项的类型推断
  // TypeScript 无法知道这是一个 vue 组件的选项对象
};
```

# 限制

## Unwrap

数组索引属性无法进行自动的`Unwrap`:

### **不要**使用 `Array` 直接存取 `ref` 对象:

```js
const state = reactive({
  list: [ref(0)],
});
// no unwrap, `.value` is required
state.list[0].value === 0; // true

state.list.push(ref(1);
//  no unwrap, `.value` is required
state.list[1].value === 1; // true
```

### **不要**在数组中使用含有 `ref` 的普通对象:

```js
const a = {
  count: ref(0),
};
const b = reactive({
  list: [a], // a.count will not unwrap!!
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

### **应该**总是将 `ref` 存放到 `reactive` 对象中:

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
