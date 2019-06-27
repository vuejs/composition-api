# Vue Function API

> [Function-based Component API RFC](https://github.com/vuejs/rfcs/blob/function-apis/active-rfcs/0000-function-api.md)

Future-Oriented Programming, `vue-function-api` provides function api from `Vue3.x` to `Vue2.x` for developing next-generation Vue applications.

[**中文文档**](./README.zh-CN.md)

---

# Navigation

- [Changelog](https://github.com/vuejs/vue-function-api/blob/master/CHANGELOG.md)
- [Installation](#Installation)
- [Usage](#Usage)
- [Example](#Example)
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
- [Misc](#Misc)

# Installation

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
By using the global variable `window.vueFunctionApi`


# Usage

You must explicitly install `vue-function-api` via `Vue.use()`:

```js
import Vue from 'vue'
import { plugin } from 'vue-function-api'

Vue.use(plugin)
```

After installing the plugin you can use the new [function API](#API) to compose your component.

# Example

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

A new component option, `setup()` is introduced. As the name suggests, this is the place where we use the function-based APIs to setup the logic of our component. `setup()` is called when an instance of the component is created, after props resolution. The function receives the resolved props as its first argument.

The second argument provides a `context` object which exposes a number of properties that were previously exposed on this in 2.x APIs.

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

▸ **value**(value: *`any`*): [`Wrapper`][Wrapper]

Calling `value()` returns a **value wrapper** object that contains a single reactive property: `.value`.

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

Equivalent with [`Vue.observable`](https://vuejs.org/v2/api/index.html#Vue-observable).

Example:

```js
import { state } from 'vue-function-api'

const object = state({
  count: 0
})

object.count++
```

## computed
▸ **computed**(getter: *`Function`*, setter?: *`Function`*): [`Wrapper`][Wrapper]

Equivalent with computed property from `vue 2.x`.

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

The `watch` API provides a way to perform side effect based on reactive state changes.

**Returns** a `Function` to stop the `watch`.

> [effect-cleanup](https://github.com/vuejs/rfcs/blob/function-apis/active-rfcs/0000-function-api.md#effect-cleanup) is NOT supported currently.

### WatchOption
| Name | Type | Default | Description |
| ------ | ------ | ------ | ------ |
| lazy | `boolean` | `false` | The opposite of 2.x's `immediate` option |
| deep | `boolean` | `false` | Same as 2.x |
| flush | `"pre"` \| `"post"` \| `"sync"` | `"post"` | `"post"`: fire after renderer flush; `"pre"`: fire before renderer flush; `"sync"`: fire synchronously |


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

Example (Multiple Sources):

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

All current lifecycle hooks will have an equivalent `onXXX` function that can be used inside `setup()`

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

Equivalent with `provide` and `inject` from `2.x`

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
The `context` object exposes a number of properties that were previously exposed on this in 2.x APIs:

```js
const MyComponent = {
  setup(props, context) {
    context.attrs
    context.slots
    context.refs
    context.emit
    context.parent
    context.root
  }
}
```

Full properties list:

* parent
* root
* refs
* slots
* attrs
* emit

# Misc

- `vue-function-api` will keep updated with `Vue3.x` API. When `3.0` released, you can replace this library seamlessly.
- `vue-function-api` only relies on `Vue2.x` itself. Wheather `Vue3.x` is released or not, it's not affect you using this library.
- Due the the limitation of `Vue2.x`'s public API. `vue-function-api` inevitably introduce some extract workload. It doesn't concern you if you are now working on extreme environment.


[wrapper]: https://github.com/vuejs/rfcs/blob/function-apis/active-rfcs/0000-function-api.md#why-do-we-need-value-wrappers
