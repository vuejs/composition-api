const Vue = require('vue/dist/vue.common.js');
const {
  plugin,
  onCreated,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeDestroy,
  onDestroyed,
} = require('../../src');

Vue.use(plugin);

describe('Hooks lifecycle', () => {
  describe('created', () => {
    it('should have completed observation', () => {
      const spy = jest.fn();
      new Vue({
        data: {
          a: 1,
        },
        setup() {
          onCreated(() => {
            expect(this.a).toBe(1);
            spy();
          });
        },
      });
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('beforeMount', () => {
    it('should not have mounted', () => {
      const spy = jest.fn();
      const vm = new Vue({
        render() {},
        setup() {
          onBeforeMount(() => {
            spy();
            expect(this._isMounted).toBe(false);
            expect(this.$el).toBeUndefined(); // due to empty mount
            expect(this._vnode).toBeNull();
            expect(this._watcher).toBeNull();
          });
        },
      });
      expect(spy).not.toHaveBeenCalled();
      vm.$mount();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('mounted', () => {
    it('should have mounted', () => {
      const spy = jest.fn();
      const vm = new Vue({
        template: '<div></div>',
        setup() {
          onMounted(() => {
            spy();
            expect(this._isMounted).toBe(true);
            expect(this.$el.tagName).toBe('DIV');
            expect(this._vnode.tag).toBe('div');
          });
        },
      });
      expect(spy).not.toHaveBeenCalled();
      vm.$mount();
      expect(spy).toHaveBeenCalled();
    });

    it('should call for manually mounted instance with parent', () => {
      const spy = jest.fn();
      const parent = new Vue();
      expect(spy).not.toHaveBeenCalled();
      new Vue({
        parent,
        template: '<div></div>',
        setup() {
          onMounted(() => {
            spy();
          });
        },
      }).$mount();
      expect(spy).toHaveBeenCalled();
    });

    it('should mount child parent in correct order', () => {
      const calls = [];
      new Vue({
        template: '<div><test></test></div>',
        setup() {
          onMounted(() => {
            calls.push('parent');
          });
        },
        components: {
          test: {
            template: '<nested></nested>',
            setup() {
              onMounted(() => {
                expect(this.$el.parentNode).toBeTruthy();
                calls.push('child');
              });
            },
            components: {
              nested: {
                template: '<div></div>',
                setup() {
                  onMounted(() => {
                    expect(this.$el.parentNode).toBeTruthy();
                    calls.push('nested');
                  });
                },
              },
            },
          },
        },
      }).$mount();
      expect(calls).toEqual(['nested', 'child', 'parent']);
    });
  });

  describe('beforeUpdate', () => {
    it('should be called before update', done => {
      const spy = jest.fn();
      const vm = new Vue({
        template: '<div>{{ msg }}</div>',
        data: { msg: 'foo' },
        setup() {
          onBeforeUpdate(() => {
            spy();
            expect(this.$el.textContent).toBe('foo');
          });
        },
      }).$mount();
      expect(spy).not.toHaveBeenCalled();
      vm.msg = 'bar';
      expect(spy).not.toHaveBeenCalled(); // should be async
      waitForUpdate(() => {
        expect(spy).toHaveBeenCalled();
      }).then(done);
    });

    it('should be called before render and allow mutating state', done => {
      const vm = new Vue({
        template: '<div>{{ msg }}</div>',
        data: { msg: 'foo' },
        setup() {
          onBeforeUpdate(() => {
            this.msg += '!';
          });
        },
      }).$mount();
      expect(vm.$el.textContent).toBe('foo');
      vm.msg = 'bar';
      waitForUpdate(() => {
        expect(vm.$el.textContent).toBe('bar!');
      }).then(done);
    });

    it('should not be called after destroy', done => {
      const beforeUpdate = jest.fn();
      const destroyed = jest.fn();

      Vue.component('todo', {
        template: '<div>{{todo.done}}</div>',
        props: ['todo'],
        setup() {
          onBeforeUpdate(beforeUpdate);
          onDestroyed(destroyed);
        },
      });

      const vm = new Vue({
        template: `
          <div>
            <todo v-for="t in pendingTodos" :todo="t" :key="t.id"></todo>
          </div>
        `,
        data() {
          return {
            todos: [{ id: 1, done: false }],
          };
        },
        computed: {
          pendingTodos() {
            return this.todos.filter(t => !t.done);
          },
        },
      }).$mount();

      vm.todos[0].done = true;
      waitForUpdate(() => {
        expect(destroyed).toHaveBeenCalled();
        expect(beforeUpdate).not.toHaveBeenCalled();
      }).then(done);
    });
  });

  describe('updated', () => {
    it('should be called after update', done => {
      const spy = jest.fn();
      const vm = new Vue({
        template: '<div>{{ msg }}</div>',
        data: { msg: 'foo' },
        setup() {
          onUpdated(() => {
            spy();
            expect(this.$el.textContent).toBe('bar');
          });
        },
      }).$mount();
      expect(spy).not.toHaveBeenCalled();
      vm.msg = 'bar';
      expect(spy).not.toHaveBeenCalled(); // should be async
      waitForUpdate(() => {
        expect(spy).toHaveBeenCalled();
      }).then(done);
    });

    it('should be called after children are updated', done => {
      const calls = [];
      const vm = new Vue({
        template: '<div><test ref="child">{{ msg }}</test></div>',
        data: { msg: 'foo' },
        components: {
          test: {
            template: `<div><slot></slot></div>`,
            setup() {
              onUpdated(() => {
                expect(this.$el.textContent).toBe('bar');
                calls.push('child');
              });
            },
          },
        },
        setup() {
          onUpdated(() => {
            expect(this.$el.textContent).toBe('bar');
            calls.push('parent');
          });
        },
      }).$mount();

      expect(calls).toEqual([]);
      vm.msg = 'bar';
      expect(calls).toEqual([]);
      waitForUpdate(() => {
        expect(calls).toEqual(['child', 'parent']);
      }).then(done);
    });

    it('should not be called after destroy', done => {
      const updated = jest.fn();
      const destroyed = jest.fn();

      Vue.component('todo', {
        template: '<div>{{todo.done}}</div>',
        props: ['todo'],
        setup() {
          onUpdated(updated);
          onDestroyed(destroyed);
        },
      });

      const vm = new Vue({
        template: `
          <div>
            <todo v-for="t in pendingTodos" :todo="t" :key="t.id"></todo>
          </div>
        `,
        data() {
          return {
            todos: [{ id: 1, done: false }],
          };
        },
        computed: {
          pendingTodos() {
            return this.todos.filter(t => !t.done);
          },
        },
      }).$mount();

      vm.todos[0].done = true;
      waitForUpdate(() => {
        expect(destroyed).toHaveBeenCalled();
        expect(updated).not.toHaveBeenCalled();
      }).then(done);
    });
  });

  describe('beforeDestroy', () => {
    it('should be called before destroy', () => {
      const spy = jest.fn();
      const vm = new Vue({
        render() {},
        setup() {
          onBeforeDestroy(() => {
            spy();
            expect(this._isBeingDestroyed).toBe(false);
            expect(this._isDestroyed).toBe(false);
          });
        },
      }).$mount();
      expect(spy).not.toHaveBeenCalled();
      vm.$destroy();
      vm.$destroy();
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls.length).toBe(1);
    });
  });

  describe('destroyed', () => {
    it('should be called after destroy', () => {
      const spy = jest.fn();
      const vm = new Vue({
        render() {},
        setup() {
          onDestroyed(() => {
            spy();
            expect(this._isBeingDestroyed).toBe(true);
            expect(this._isDestroyed).toBe(true);
          });
        },
      }).$mount();
      expect(spy).not.toHaveBeenCalled();
      vm.$destroy();
      vm.$destroy();
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls.length).toBe(1);
    });
  });
});
