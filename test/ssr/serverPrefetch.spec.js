const Vue = require('vue/dist/vue.common.js');
const { createRenderer } = require('vue-server-renderer');
const { ref, onServerPrefetch, getCurrentInstance } = require('../../src');

function fetch(result) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(result);
    }, 10);
  });
}

describe('serverPrefetch', () => {
  it('should prefetch async operations before rendering', async () => {
    const app = new Vue({
      setup() {
        const count = ref(0);

        onServerPrefetch(async () => {
          count.value = await fetch(42);
        });

        return {
          count,
        };
      },
      render(h) {
        return h('div', this.count);
      },
    });

    const serverRenderer = createRenderer();
    const html = await serverRenderer.renderToString(app);
    expect(html).toBe('<div data-server-rendered="true">42</div>');
  });

  it('should prefetch many async operations before rendering', async () => {
    const app = new Vue({
      setup() {
        const count = ref(0);
        const label = ref('');

        onServerPrefetch(async () => {
          count.value = await fetch(42);
        });

        onServerPrefetch(async () => {
          label.value = await fetch('meow');
        });

        return {
          count,
          label,
        };
      },
      render(h) {
        return h('div', [this.count, this.label]);
      },
    });

    const serverRenderer = createRenderer();
    const html = await serverRenderer.renderToString(app);
    expect(html).toBe('<div data-server-rendered="true">42meow</div>');
  });

  it('should not share context', async () => {
    const instances = [];
    function createApp(context) {
      return new Vue({
        setup() {
          const count = ref(0);

          onServerPrefetch(async () => {
            count.value = await fetch(context.result);
          });

          instances.push(getCurrentInstance());

          return {
            count,
          };
        },
        render(h) {
          return h('div', this.count);
        },
      });
    }

    const serverRenderer = createRenderer();
    for (let i = 1; i < 3; i++) {
      const app = createApp({ result: i });
      const html = await serverRenderer.renderToString(app);
      expect(html).toBe(`<div data-server-rendered="true">${i}</div>`);
    }
    expect((instances[0] === instances[1]) === instances[2]).toBe(false);
  });
});
