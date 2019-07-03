# Vue Function API

> [通过基于函数的 API 来复用组件逻辑](https://zhuanlan.zhihu.com/p/68477600)

面向未来编程(Future-Oriented Programming)，`vue-function-api` 提供 Vue3 中的组件逻辑复用机制帮助开发者开发下一代 vue 应用程序，允许开发者利用 Vue3 的响应性 API 建设未来 Vue 生态。

[**English Version**](./README.md)

---

# 导航

- [Changelog](https://github.com/vuejs/vue-function-api/blob/master/CHANGELOG.md)
- [安装](#安装)
- [使用](#使用)
- [示例](#示例)
  - [Todo App Compare with Vue2 API](https://codesandbox.io/s/todo-example-6d7ep)
  - [CodePen Live Demo](https://codepen.io/liximomo/pen/dBOvgg)
  - [Single-File Component](#single-file-Component)
- [API](#API)
    -  [setup](#setup)
    -  [value](#value)
    -  [state](#state)
    -  [computed](#computed)
    -  [watch](#watch)
    -  [lifecycle](#lifecycle)
    -  [provide, inject](#provide-inject)
- [其他](#其他)

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

**CodePen**

[在线示例](https://codepen.io/liximomo/pen/dBOvgg)，fork 后进行测试或 bug 反馈。

# 使用
您必须显式地通过 `Vue.use()` 来安装 `vue-function-api`:

```js
import Vue from 'vue'
import { plugin } from 'vue-function-api'

Vue.use(plugin)
```

安装插件后，您就可以使用新的[函数式 API](#API)来书写组件了。

# 示例

## [Todo App Compare with Vue2 API](https://codesandbox.io/s/todo-example-6d7ep)

## [CodePen Live Demo](https://codepen.io/liximomo/pen/dBOvgg)

## Single-File Component
``` html
<template>
  <div>
    <span>count is {{ count }}</span>
    <span>plusOne is {{ plusOne }}</span>
    <button @click="increment">count++</button>
  </div>
</template>

<script>
  import Vue from 'vue';
  import { value, computed, watch, onMounted } from 'vue-function-api'

  export default {
    setup() {
      // reactive state
      const count = value(0);
      // computed state
      const plusOne = computed(() => count.value + 1);
      // method
      const increment = () => {
        count.value++;
      };
      // watch
      watch(
        () => count.value * 2,
        val => {
          console.log(`count * 2 is ${val}`);
        }
      );
      // lifecycle
      onMounted(() => {
        console.log(`mounted`);
      });
      // expose bindings on render context
      return {
        count,
        plusOne,
        increment,
      };
    },
  };
</script>
```

# API

## setup

▸ **setup**(props: *`Props`*, context: *[`Context`](#Context)*): `Object|undefined`

组件现在接受一个新的 `setup` 选项，在这里我们利用函数 api 进行组件逻辑设置。

`setup()` 中不可以使用 `this` 访问当前组件实例, 我们可以通过 `setup` 的第二个参数 `context` 来访问 vue2.x API 中实例上的属性。

```js
const MyComponent = {
  props: {
    name: String
  },
  setup(props, context) {
    console.log(props.name);
    // context.attrs
    // context.slots
    // context.refs
    // context.emit
    // context.parent
    // context.root
  }
}
```

## value

▸ **value**(value: *`any`*): [`Wrapper`](#Wrapper)

`value` 函数为组件声明一个响应式属性，我们只需要在 `setup` 函数中返回 `value` 的返回值即可。

Example:

```js
import { value } from 'vue-function-api'

const MyComponent = {
  setup(props) {
    const msg = value('hello')
    const appendName = () => {
      msg.value = `hello ${props.name}`
    }
    return {
      msg,
      appendName
    }
  },
  template: `<div @click="appendName">{{ msg }}</div>`
}
```

## state
▸ **state**(value: *`any`*)

与 [`Vue.observable`](https://vuejs.org/v2/api/index.html#Vue-observable) 等价。

Example:

```js
import { state } from 'vue-function-api'

const object = state({
  count: 0
})

object.count++
```

## computed
▸ **computed**(getter: *`Function`*, setter?: *`Function`*): [`Wrapper`](#Wrapper)

与 vue 2.x computed property 行为一致。

Example:

```js
import { value, computed } from 'vue-function-api'

const count = value(0)
const countPlusOne = computed(() => count.value + 1)

console.log(countPlusOne.value) // 1

count.value++
console.log(countPlusOne.value) // 2
```

## watch
▸ **watch**(source: *`Wrapper | () => any`*, callback: *`(newVal, oldVal)`*, options?: *[`WatchOption`](#WatchOption)*): `Function`

▸ **watch**(source: *`Array<Wrapper | () => any>`*, callback: *`([newVal1, newVal2, ... newValN], [oldVal1, oldVal2, ... oldValN])`*, options?: *[`WatchOption`](#WatchOption)*): `Function`

`watch` 允许我们在相应的状态发生改变时执行一个回调函数。

**返回值** `Function`
一个可调用的函数来停止 `watch`。

> [effect-cleanup](https://github.com/vuejs/rfcs/blob/function-apis/active-rfcs/0000-function-api.md#effect-cleanup) 当前并不支持。

### WatchOption
| Name | Type | Default | Description |
| ------ | ------ | ------ | ------ |
| lazy | `boolean` | `false` |  与 2.x `watch` 中的 `immediate` 选项含义相反. |
| deep | `boolean` | `false` | 与 2.x 相同 |
| flush | `"pre"` \| `"post"` \| `"sync"` | `"post"` | `"post"`: render 后触发; `"pre"`: render 前触发, `"sync"`: 同步触发 |


Example:

```js
watch(
  // getter
  () => count.value + 1,
  // callback
  (value, oldValue) => {
    console.log('count + 1 is: ', value)
  }
)
// -> count + 1 is: 1

count.value++
// -> count + 1 is: 2
```

Example(Multiple Sources):

```js
watch(
  [valueA, () => valueB.value],
  ([a, b], [prevA, prevB]) => {
    console.log(`a is: ${a}`)
    console.log(`b is: ${b}`)
  }
)
```

## lifecycle
▸ **onCreated**(cb: *`Function`*)

▸ **onBeforeMount**(cb: *`Function`*)

▸ **onMounted**(cb: *`Function`*)

▸ **onXXX**(cb: *`Function`*)

支持 2.x 中除 `beforeCreated` 以外的所有生命周期函数，额外提供 `onUnmounted`。

Example:

```js
import { onMounted, onUpdated, onUnmounted } from 'vue-function-api'

const MyComponent = {
  setup() {
    onMounted(() => {
      console.log('mounted!')
    })
    onUpdated(() => {
      console.log('updated!')
    })
    onUnmounted(() => {
      console.log('unmounted!')
    })
  }
}
```

## provide, inject
▸ **provide**(value: *`Object`*)

▸ **inject**(key: *`string` | `symbol`*)

与 2.x 中的 `provide` 和 `inject` 选项行为一致。

Example:

```js
import { provide, inject } from 'vue-function-api'

const CountSymbol = Symbol()

const Ancestor = {
  setup() {
    // providing a value can make it reactive
    const count = value(0)
    provide({
      [CountSymbol]: count
    })
  }
}

const Descendent = {
  setup() {
    const count = inject(CountSymbol)
    return {
      count
    }
  }
}
```
## Context
`Context` 对象中的属性是 2.x 中的 vue 实例属性的一个子集。完整的属性列表：

* parent
* root
* refs
* slots
* attrs
* emit

## Wrapper (包装对象)
> 以下内容引自 [尤雨溪知乎专栏](https://zhuanlan.zhihu.com/p/68477600)

一个包装对象只有一个属性：`value` ，该属性指向内部被包装的值。


### 为什么需要包装对象？
我们知道在 JavaScript 中，原始值类型如 `string` 和 `number` 是只有值，没有引用的。如果在一个函数中返回一个字符串变量，接收到这个字符串的代码只会获得一个值，是无法追踪原始变量后续的变化的。

因此，包装对象的意义就在于提供一个让我们能够在函数之间以引用的方式传递任意类型值的容器。这有点像 React Hooks 中的 `useRef` —— 但不同的是 Vue 的包装对象同时还是响应式的数据源。有了这样的容器，我们就可以在封装了逻辑的组合函数中将状态以引用的方式传回给组件。组件负责展示（追踪依赖），组合函数负责管理状态（触发更新）：
```js
setup() {
  const valueA = useLogicA() // valueA 可能被 useLogicA() 内部的代码修改从而触发更新
  const valueB = useLogicB()
  return {
    valueA,
    valueB
  }
}
```

包装对象也可以包装非原始值类型的数据，被包装的对象中嵌套的属性都会被响应式地追踪。用包装对象去包装对象或是数组并不是没有意义的：它让我们可以对整个对象的值进行替换 —— 比如用一个 filter 过的数组去替代原数组：
```js
const numbers = value([1, 2, 3])
// 替代原数组，但引用不变
numbers.value = numbers.value.filter(n => n > 1)
```

如果你依然想创建一个没有包装的响应式对象，可以使用 `state` API（和 2.x 的 `Vue.observable()` 等同）：
```js
import { state } from 'vue'

const object = state({
  count: 0
})

object.count++
```

### Value Unwrapping（包装对象的自动展开）

当包装对象被暴露给模版渲染上下文，或是被嵌套在另一个响应式对象中的时候，它会被自动展开 (unwrap) 为内部的值。

比如一个包装对象的绑定可以直接被模版中的内联函数修改：
```js
const MyComponent = {
  setup() {
    return {
      count: value(0)
    }
  },
  template: `<button @click="count++">{{ count }}</button>`
}
```

当一个包装对象被作为另一个响应式对象的属性引用的时候也会被自动展开：

```js
const count = value(0)
const obj = state({
  count
})

console.log(obj.count) // 0

obj.count++
console.log(obj.count) // 1
console.log(count.value) // 1

count.value++
console.log(obj.count) // 2
console.log(count.value) // 2
```

以上这些关于包装对象的细节可能会让你觉得有些复杂，但实际使用中你只需要记住一个基本的规则：只有当你直接以变量的形式引用一个包装对象的时候才会需要用 `.value` 去取它内部的值 —— 在模版中你甚至不需要知道它们的存在。


# 其他

- `vue-function-api` 会一直保持与 `Vue3.x` 的兼容性，当 `3.0` 发布时，您可以无缝替换掉本库。
- `vue-function-api` 的实现只依赖 `Vue2.x` 本身，不论 `Vue3.x` 的发布与否，都不会影响您正常使用本库。
- 由于 `Vue2.x` 的公共 API 限制，`vue-function-api` 无法避免的会产生一些额外的内存负载。如果您的应用并不工作在极端内存环境下，无需关心此项。
