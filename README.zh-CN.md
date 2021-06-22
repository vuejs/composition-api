# @vue/composition-api

用于提供 **组合式 API** 的 Vue 2 插件.

[![npm](https://img.shields.io/npm/v/@vue/composition-api)](https://www.npmjs.com/package/@vue/composition-api)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/vuejs/composition-api/Build%20&%20Test)](https://github.com/vuejs/composition-api/actions?query=workflow%3A%22Build+%26+Test%22)

[English](./README.md) | 中文 ・ [**组合式 API 文档**](https://v3.cn.vuejs.org/guide/composition-api-introduction.html)

## 安装

### NPM

```bash
npm install @vue/composition-api
# or
yarn add @vue/composition-api
```

在使用 `@vue/composition-api` 前，必须先通过 `Vue.use()` 进行安装。之后才可使用新的 [**组合式 API**](https://composition-api.vuejs.org/zh) 进行组件开发。

```js
import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'

Vue.use(VueCompositionAPI)
```

```js
// 使用 API
import { ref, reactive } from '@vue/composition-api'
```

> :bulb: 当迁移到 Vue 3 时，只需简单的将 `@vue/composition-api` 替换成 `vue` 即可。你现有的代码几乎无需进行额外的改动。

### CDN

在 Vue 之后引入 `@vue/composition-api` ，插件将会自动完成安装。

<!--cdn-links-start-->
```html
<script src="https://cdn.jsdelivr.net/npm/vue@2.6"></script>
<script src="https://cdn.jsdelivr.net/npm/@vue/composition-api@1.0.0-rc.12"></script>
```
<!--cdn-links-end-->

`@vue/composition-api` 将会暴露在全局变量 `window.VueCompositionAPI` 中。

```ts
const { ref, reactive } = VueCompositionAPI
```

## TypeScript 支持

> 本插件要求使用 TypeScript **3.5.1** 或以上版本

为了让 TypeScript 在 Vue 组件选项中正确地进行类型推导，我们必须使用 `defineComponent` 来定义组件:

```ts
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  // 类型推断启用
})
```

### JSX/TSX

JSX 现已在 [vuejs/jsx](https://github.com/vuejs/jsx) 中官方支持。你可以根据[这篇文档](https://github.com/vuejs/jsx/tree/dev/packages/babel-preset-jsx#usage)开启支持。你也可以使用由 [@luwanquan](https://github.com/luwanquan) 维护的社区版本 [babel-preset-vca-jsx](https://github.com/luwanquan/babel-preset-vca-jsx)。

对于 TSX 支持，请在你的项目中创建如下声明文件：

```ts
// file: shim-tsx.d.ts
import Vue, { VNode } from 'vue';
import { ComponentRenderProxy } from '@vue/composition-api';

declare global {
  namespace JSX {
    interface Element extends VNode {}
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

## SSR

尽管 Vue 3 暂时没有给出确定的 SSR 的 API，这个插件实现了 `onServerPrefetch` 生命周期钩子函数。这个钩子允许你使用传统 API 中的 `serverPrefetch` 函数。

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
  },
}
```

## 限制

> :white_check_mark: 支持 &nbsp;&nbsp;&nbsp;&nbsp;:x: 不支持

### `Ref` 自动展开 (unwrap)

<details>
<summary>
❌ <b>不要</b> 在数组中使用含有 <code>ref</code> 的普通对象
</summary>

```js
const a = {
  count: ref(0),
}
const b = reactive({
  list: [a], // `a.count` 不会自动展开!!
})

// `count` 不会自动展开, 须使用 `.value`
b.list[0].count.value === 0 // true
```

```js
const b = reactive({
  list: [
    {
      count: ref(0), // 不会自动展开!!
    },
  ],
})

// `count` 不会自动展开, 须使用 `.value`
b.list[0].count.value === 0 // true
```

</details>

<details>
<summary>
✅ 在数组中，<b>应该</b> 总是将 <code>ref</code> 存放到 <code>reactive</code> 对象中
</summary>

```js
const a = reactive({
  count: ref(0),
})
const b = reactive({
  list: [a],
})
// 自动展开
b.list[0].count === 0 // true

b.list.push(
  reactive({
    count: ref(1),
  })
)
// 自动展开
b.list[1].count === 1 // true
```

</details>

<details>
<summary>
⚠️ <code>set</code> 和 <code>del</code> 添加与刪除响应式属性变通方案
</summary>

> ⚠️ 警告: `set` 和 `del` 并非 Vue 3 的一部分。由于 [Vue 2.x 响应式系统的限制](https://vuejs.org/v2/guide/reactivity.html#For-Objects)，我们在插件中提供该 API 作为添加响应式属性的一个变通方案。在 Vue 3 中，你只需要直接为属性赋值即可。

```ts
import { reactive, set } from '@vue/composition-api'

const a = reactive({
  foo: 1
})

// 添加新的响应式属性
set(a, 'bar', 1)

// 刪除属性并触发响应式更新
del(a, 'bar')
```

</details>

### 模板 Refs

<details>
<summary>
✅ 字符串 ref && 从 <code>setup()</code> 返回 ref
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
        // 在初次渲染后 DOM 元素会被赋值给 ref
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
✅ 字符串 ref && 从 <code>setup()</code> 返回 ref && 渲染函数 / JSX
</summary>

```jsx
export default {
  setup() {
    const root = ref(null)

    onMounted(() => {
      // 在初次渲染后 DOM 元素会被赋值给 ref
      console.log(root.value) // <div/>
    })

    return {
      root,
    }
  },
  render() {
    // 使用 JSX
    return () => <div ref="root" />
  },
}
```

</details>

<details>
<summary>
❌ 函数 ref
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
❌ 在 <code>setup()</code> 中的渲染函数 / JSX
</summary>

```jsx
export default {
  setup() {
    const root = ref(null)

    return () =>
      h('div', {
        ref: root,
      })

    // 使用 JSX
    return () => <div ref={root} />
  },
}
```

</details>

<details>
<summary>
⚠️ <code>$refs</code> 访问的变通方案
</summary>

> :warning: **警告**: `SetupContext.refs` 并非 `Vue 3.0` 的一部分, `@vue/composition-api` 将其暴露在 `SetupContext` 中只是临时提供一种变通方案。

如果你依然选择在 `setup()` 中写 `render` 函数，那么你可以使用 `SetupContext.refs` 来访问模板引用，它等价于 Vue 2.x 中的 `this.$refs`:

```js
export default {
  setup(initProps, setupContext) {
    const refs = setupContext.refs
    onMounted(() => {
      // 在初次渲染后 DOM 元素会被赋值给 ref
      console.log(refs.root) // <div/>
    })

    return () =>
      h('div', {
        ref: 'root',
      })

    // 使用 JSX
    return () => <div ref="root" />
  },
}
```

如果项目使用了 TypeScript，你还需要扩展 `SetupContext` 类型:

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
⚠️ <code>reactive()</code> 会返回一个<b>修改过的</b>原始的对象
</summary>

此行为与 Vue 2 中的 `Vue.observable` 一致

> :bulb: 在 Vue 3 中，`reactive()` 会返回一个新的的代理对象

</details>

### Watch

<details>
<summary>
❌ 不支持 <code>onTrack</code> 和 <code>onTrigger</code> 选项
</summary>

```js
watch(
  () => {
    /* ... */
  },
  {
    immediate: true,
    onTrack() {}, // 不可用
    onTrigger() {}, // 不可用
  }
)
```

</details>

### `shallowReadonly`

<details>
<summary>
⚠️ <code>shallowReadonly()</code> 会返回一个新的浅拷贝对象，在此之后新加的字段<b>将不会</b>获得只读或响应式状态。
</summary>

> :bulb: 在 Vue 3 中，`shallowReadonly()` 会返回一个新的的代理对象

</details>

### `readonly`

<details>
<summary>
⚠️ <code>readonly()</code> **只提供类型层面**的只读。
</summary>

`readonly()` 只在类型层面提供和 Vue 3 的对齐。在其返回值或其属性上使用 <code>isReadonly()</code> 检查的结果将无法保证。

</details>

### `props`

<details>
<summary>
⚠️ 当使用 <code>toRefs</code> 访问深层属性对象 （如 <code>toRefs(props.foo)</code> 时将会得到不正确的警告。<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⚠️ <code>isReactive(props.foo)</code> 将会返回 false。
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

### 缺失的 API

以下在 Vue 3 新引入的 API ，在本插件中暂不适用：

- `onRenderTracked`
- `onRenderTriggered`
- `isProxy`

### 在 `data()` 中使用组合式 API

<details>
<summary>
❌ 在 <code>data()</code> 中使用 <code>ref</code>, <code>reactive</code> 或其他组合式 API 将不会生效
</summary>

```jsx
export default {
  data() {
    return {
      // 在模版中会成为 { a: { value: 1 } }
      a: ref(1),
    }
  },
}
```

</details>

### `emit` 选项

<details>
<summary>
❌ <code>emit</code> 仅因在类型定义中对齐 Vue3 的选项而提供，<b>不会</b>有任何效果。
</summary>

```ts
defineComponent({
  emit: {
    // 无效
    submit: (eventOption) => {
      if (...) {
        return true
      } else {
        console.warn('Invalid submit event payload!')
        return false
      }
    }
  }
})
```

</details>

### 性能影响

由于 Vue 2 的公共 API 的限制，`@vue/composition-api` 不可避免地引入了额外的性能开销。除非在极端情况下，否则这并不会对你造成影响。

你可以查看这个 [跑分结果](https://antfu.github.io/vue-composition-api-benchmark-results/) 了解更多信息。
