# 2.0.0
Implement the [newest version of RFC](https://github.com/vuejs/rfcs/blob/function-apis/active-rfcs/0000-function-api.md)

## Breaking Changes
`this` is not available inside `setup()`. See [setup](https://github.com/vuejs/rfcs/blob/function-apis/active-rfcs/0000-function-api.md#the-setup-function) for details.

## Features
Complex Prop Types:

```ts
import { createComponent, PropType } from 'vue'

createComponent({
  props: {
    options: (null as any) as PropType<{ msg: string }>
  },
  setup(props) {
    props.options // { msg: string } | undefined
  }
})
```

# 1.x
  Implement the [init version of RFC](https://github.com/vuejs/rfcs/blob/903f429696524d8f93b4976d5b09dfb3632e89ef/active-rfcs/0000-function-api.md)
