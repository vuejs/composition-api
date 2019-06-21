import { VueConstructor } from 'vue';
import { Wrapper } from '../wrappers';
import { isArray, assert } from '../utils';
import { isWrapper } from '../helper';
import { getCurrentVM, getCurrentVue } from '../runtimeContext';
import { WatcherPreFlushQueueKey, WatcherPostFlushQueueKey } from '../symbols';

type watcherCallBack<T> = (newVal: T, oldVal: T) => void;
type watchedValue<T> = Wrapper<T> | (() => T);
type FlushMode = 'pre' | 'post' | 'sync' | 'auto';
interface WatcherOption {
  lazy: boolean;
  deep: boolean;
  flush: FlushMode;
}
interface WatcherContext<T> {
  value: T;
  oldValue: T;
  watcherStopHandle: Function;
}

function hasWatchEnv(vm: any) {
  return vm[WatcherPreFlushQueueKey] !== undefined;
}

function installWatchEnv(vm: any) {
  vm[WatcherPreFlushQueueKey] = [];
  vm[WatcherPostFlushQueueKey] = [];
  vm.$on('hook:beforeUpdate', createFlusher(WatcherPreFlushQueueKey));
  vm.$on('hook:updated', createFlusher(WatcherPostFlushQueueKey));
}

function createFlusher(key: any) {
  return function(this: any) {
    flushQueue(this, key);
  };
}

function flushQueue(vm: any, key: any) {
  const queue = vm[key];
  for (let index = 0; index < queue.length; index++) {
    queue[index]();
  }
  queue.length = 0;
}

function flushWatcherCallback(vm: any, fn: Function, mode: FlushMode) {
  // flush all when beforeUpdate and updated are not fired
  function fallbackFlush() {
    vm.$nextTick(() => {
      if (vm[WatcherPreFlushQueueKey].length) {
        flushQueue(vm, WatcherPreFlushQueueKey);
      }
      if (vm[WatcherPostFlushQueueKey].length) {
        flushQueue(vm, WatcherPostFlushQueueKey);
      }
    });
  }

  switch (mode) {
    case 'pre':
      fallbackFlush();
      vm[WatcherPreFlushQueueKey].push(fn);
      break;
    case 'post':
      fallbackFlush();
      vm[WatcherPostFlushQueueKey].push(fn);
      break;
    case 'auto':
    case 'sync':
      fn();
      break;
    default:
      assert(false, `flush must be one of ["post", "pre", "sync"], but got ${mode}`);
      break;
  }
}

function createSingleSourceWatcher<T>(
  vm: InstanceType<VueConstructor>,
  source: watchedValue<T>,
  cb: watcherCallBack<T>,
  options: WatcherOption
): () => void {
  let getter: () => T;
  if (isWrapper<T>(source)) {
    getter = () => source.value;
  } else {
    getter = source as () => T;
  }

  let callbackRef = (n: T, o: T) => {
    callbackRef = flush;

    if (!options.lazy) {
      cb(n, o);
    } else {
      flush(n, o);
    }
  };

  const flush = (n: T, o: T) => {
    flushWatcherCallback(
      vm,
      () => {
        cb(n, o);
      },
      options.flush
    );
  };

  return vm.$watch(
    getter,
    (n: T, o: T) => {
      callbackRef(n, o);
    },
    {
      immediate: !options.lazy,
      deep: options.deep,
      // @ts-ignore
      sync: options.flush === 'sync',
    }
  );
}

function createMuiltSourceWatcher<T>(
  vm: InstanceType<VueConstructor>,
  sources: Array<watchedValue<T>>,
  cb: watcherCallBack<T[]>,
  options: WatcherOption
): () => void {
  let execCallbackAfterNumRun: false | number = options.lazy ? false : sources.length;
  let pendingCallback = false;
  const watcherContext: WatcherContext<T>[] = [];

  function execCallback() {
    cb.apply(
      vm,
      watcherContext.reduce<[T[], T[]]>(
        (acc, ctx) => {
          acc[0].push(ctx.value);
          acc[1].push(ctx.oldValue);
          return acc;
        },
        [[], []]
      )
    );
  }
  function stop() {
    watcherContext.forEach(ctx => ctx.watcherStopHandle());
  }

  let callbackRef = () => {
    if (execCallbackAfterNumRun !== false) {
      if (--execCallbackAfterNumRun === 0) {
        execCallbackAfterNumRun = false;
        callbackRef = flush;
        execCallback();
      }
    } else {
      callbackRef = flush;
      flush();
    }
  };

  const flush = () => {
    if (!pendingCallback) {
      pendingCallback = true;
      flushWatcherCallback(
        vm,
        () => {
          pendingCallback = false;
          execCallback();
        },
        options.flush
      );
    }
  };

  sources.forEach(source => {
    let getter: () => T;
    if (isWrapper<T>(source)) {
      getter = () => source.value;
    } else {
      getter = source as () => T;
    }
    const watcherCtx = {} as WatcherContext<T>;
    // must push watcherCtx before create watcherStopHandle
    watcherContext.push(watcherCtx);

    watcherCtx.watcherStopHandle = vm.$watch(
      getter,
      (n: T, o: T) => {
        watcherCtx.value = n;
        watcherCtx.oldValue = o;

        callbackRef();
      },
      {
        immediate: !options.lazy,
        deep: options.deep,
        // @ts-ignore
        sync: options.flush === 'sync',
      }
    );
  });

  return stop;
}

export function watch<T>(
  source: watchedValue<T>,
  cb: watcherCallBack<T>,
  options?: Partial<WatcherOption>
): () => void;
export function watch<T>(
  source: Array<watchedValue<T>>,
  cb: watcherCallBack<T[]>,
  options?: Partial<WatcherOption>
): () => void;
export function watch<T>(
  source: watchedValue<T> | Array<watchedValue<T>>,
  cb: watcherCallBack<T> | watcherCallBack<T[]>,
  options: Partial<WatcherOption> = {}
): () => void {
  const opts: WatcherOption = {
    ...{
      lazy: false,
      deep: false,
      flush: 'post',
    },
    ...options,
  };
  let vm = getCurrentVM();
  if (!vm) {
    const Vue = getCurrentVue();
    const silent = Vue.config.silent;
    Vue.config.silent = true;
    vm = new Vue();
    Vue.config.silent = silent;
    opts.flush = 'auto';
  }

  if (!hasWatchEnv(vm)) installWatchEnv(vm);

  if (isArray(source)) {
    return createMuiltSourceWatcher(vm, source, cb as watcherCallBack<T[]>, opts);
  }
  return createSingleSourceWatcher(vm, source, cb as watcherCallBack<T>, opts);
}
