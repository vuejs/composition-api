import { createComponent, createElement as h, ref, SetupContext } from '../../src';
const Vue = require('vue/dist/vue.common.js');

type Equal<Left, Right> = (<U>() => U extends Left ? 1 : 0) extends (<U>() => U extends Right
  ? 1
  : 0)
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

describe('createComponent', () => {
  it('should work', () => {
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
  });

  it('should infer props type', () => {
    const App = createComponent({
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
    const App = createComponent<IPropsType>({
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

  it('no props', () => {
    const App = createComponent({
      setup(props, ctx) {
        isTypeEqual<SetupContext, typeof ctx>(true);
        isTypeEqual<never, typeof props>(true);
        return () => null;
      },
    });
    new Vue(App);
    expect.assertions(2);
  });

  it('infer the required prop', () => {
    const App = createComponent({
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
});
