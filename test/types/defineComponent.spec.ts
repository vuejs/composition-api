import {
  createComponent,
  defineComponent,
  createElement as h,
  ref,
  SetupContext,
  PropType,
} from '../../src';
import Router from 'vue-router';

const Vue = require('vue/dist/vue.common.js');

type Equal<Left, Right> = (<U>() => U extends Left ? 1 : 0) extends <U>() => U extends Right ? 1 : 0
  ? true
  : false;

const isTypeEqual = <Left, Right>(shouldBeEqual: Equal<Left, Right>) => {
  void shouldBeEqual;
  expect(true).toBe(true);
};
const isSubType = <SuperType, SubType>(shouldBeEqual: SubType extends SuperType ? true : false) => {
  void shouldBeEqual;
  expect(true).toBe(true);
};

describe('defineComponent', () => {
  it('should work', () => {
    const Child = defineComponent({
      props: { msg: String },
      setup(props) {
        return () => h('span', props.msg);
      },
    });

    const App = defineComponent({
      setup() {
        const msg = ref('hello');
        return () =>
          h('div', [
            h(Child, {
              props: {
                msg: msg.value,
              },
            }),
          ]);
      },
    });
    const vm = new Vue(App).$mount();
    expect(vm.$el.querySelector('span').textContent).toBe('hello');
  });

  it('should infer props type', () => {
    const App = defineComponent({
      props: {
        a: {
          type: Number,
          default: 0,
        },
        b: String,
      },
      setup(props, ctx) {
        type PropsType = typeof props;
        isTypeEqual<SetupContext, typeof ctx>(true);
        isSubType<PropsType, { readonly b?: string; readonly a: number }>(true);
        isSubType<{ readonly b?: string; readonly a: number }, PropsType>(true);
        return () => null;
      },
    });
    new Vue(App);
    expect.assertions(3);
  });

  it('custom props interface', () => {
    interface IPropsType {
      b: string;
    }
    const App = defineComponent<IPropsType>({
      props: {
        b: {},
      },
      setup(props, ctx) {
        type PropsType = typeof props;
        isTypeEqual<SetupContext, typeof ctx>(true);
        isSubType<PropsType, { b: string }>(true);
        isSubType<{ b: string }, PropsType>(true);
        return () => null;
      },
    });
    new Vue(App);
    expect.assertions(3);
  });

  it('custom props type function', () => {
    interface IPropsTypeFunction {
      fn: (arg: boolean) => void;
    }
    const App = defineComponent<IPropsTypeFunction>({
      props: {
        fn: Function as PropType<(arg: boolean) => void>,
      },
      setup(props, ctx) {
        type PropsType = typeof props;
        isTypeEqual<SetupContext, typeof ctx>(true);
        isSubType<PropsType, { fn: (arg: boolean) => void }>(true);
        isSubType<{ fn: (arg: boolean) => void }, PropsType>(true);
        return () => null;
      },
    });
    new Vue(App);
    expect.assertions(3);
  });

  it('custom props type inferred from PropType', () => {
    interface User {
      name: string;
    }
    const App = defineComponent({
      props: {
        user: Object as PropType<User>,
        func: Function as PropType<() => boolean>,
        userFunc: Function as PropType<(u: User) => User>,
      },
      setup(props) {
        type PropsType = typeof props;
        isSubType<{ user?: User }, PropsType>(true);
        isSubType<PropsType, { user?: User; func?: () => boolean; userFunc?: (u: User) => User }>(
          true
        );
      },
    });
    new Vue(App);
    expect.assertions(2);
  });

  it('no props', () => {
    const App = defineComponent({
      setup(props, ctx) {
        isTypeEqual<SetupContext, typeof ctx>(true);
        isTypeEqual<unknown, typeof props>(true);
        return () => null;
      },
    });
    new Vue(App);
    expect.assertions(2);
  });

  it('infer the required prop', () => {
    const App = defineComponent({
      props: {
        foo: {
          type: String,
          required: true,
        },
        bar: {
          type: String,
          default: 'default',
        },
        zoo: {
          type: String,
          required: false,
        },
      },
      propsData: {
        foo: 'foo',
      },
      setup(props) {
        type PropsType = typeof props;
        isSubType<{ readonly foo: string; readonly bar: string; readonly zoo?: string }, PropsType>(
          true
        );
        isSubType<PropsType, { readonly foo: string; readonly bar: string; readonly zoo?: string }>(
          true
        );
        return () => null;
      },
    });
    new Vue(App);
    expect.assertions(2);
  });

  describe('compatible with vue router', () => {
    it('RouteConfig.component', () => {
      new Router({
        routes: [
          {
            path: '/',
            name: 'root',
            component: defineComponent({}),
          },
        ],
      });
    });
  });

  describe('retro-compatible with createComponent', () => {
    it('should still work and warn', () => {
      const warn = jest.spyOn(global.console, 'error').mockImplementation(() => null);
      const Child = createComponent({
        props: { msg: String },
        setup(props) {
          return () => h('span', props.msg);
        },
      });

      const App = createComponent({
        setup() {
          const msg = ref('hello');
          return () =>
            h('div', [
              h(Child, {
                props: {
                  msg: msg.value,
                },
              }),
            ]);
        },
      });
      const vm = new Vue(App).$mount();
      expect(vm.$el.querySelector('span').textContent).toBe('hello');
      expect(warn.mock.calls[0][0]).toMatch(
        '[Vue warn]: `createComponent` has been renamed to `defineComponent`.'
      );
      warn.mockRestore();
    });
  });
});
