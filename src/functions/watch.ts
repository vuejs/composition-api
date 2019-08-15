import { ComponentInstance } from '../ts-api';
import { Wrapper } from '../wrappers';
import { isArray, assert } from '../utils';
import { createComponentInstance } from '../helper';
import { isWrapper } from '../wrappers';
import { getCurrentVM, getCurrentVue } from '../runtimeContext';
import { WatcherPreFlushQueueKey, WatcherPostFlushQueueKey } from '../symbols';

const INIT_VALUE = {};
type InitValue = typeof INIT_VALUE;
type watcherCallBack<T> = (newVal: T, oldVal: T) => void;
type watchedValue<T> = Wrapper<T> | (() => T);
type FlushMode = 'pre' | 'post' | 'sync';
interface WatcherOption {
  lazy: boolean;
  deep: boolean;
  flush: FlushMode;
}
interface WatcherContext<T> {
  getter: () => T;
  value: T | InitValue;
  oldValue: T | InitValue;
  watcherStopHandle: Function;
}

let fallbackVM: ComponentInstance;

function flushPreQueue(this: any) {
  flushQueue(this, WatcherPreFlushQueueKey);
}

function flushPostQueue(this: any) {
  flushQueue(this, WatcherPostFlushQueueKey);
}

function hasWatchEnv(vm: any) {
  return vm[WatcherPreFlushQueueKey] !== undefined;
}

function installWatchEnv(vm: any) {
  vm[WatcherPreFlushQueueKey] = [];
  vm[WatcherPostFlushQueueKey] = [];
  vm.$on('hook:beforeUpdate', flushPreQueue);
  vm.$on('hook:updated', flushPostQueue);
}

function flushQueue(vm: any, key: any) {
  const queue = vm[key];
  for (let index = 0; index < queue.length; index++) {
    queue[index]();
  }
  queue.length = 0;
}

function scheduleFlush(vm: any, fn: Function, mode: Exclude<FlushMode, 'sync'>) {
  if (vm === fallbackVM) {
    // no render pipeline, ignore flush mode
    fn();
  } else {
    // flush all when beforeUpdate and updated are not fired
    const fallbackFlush = () => {
      vm.$nextTick(() => {
        if (vm[WatcherPreFlushQueueKey].length) {
          flushQueue(vm, WatcherPreFlushQueueKey);
        }
        if (vm[WatcherPostFlushQueueKey].length) {
          flushQueue(vm, WatcherPostFlushQueueKey);
        }
      });
    };

    switch (mode) {
      case 'pre':
        fallbackFlush();
        vm[WatcherPreFlushQueueKey].push(fn);
        break;
      case 'post':
        fallbackFlush();
        vm[WatcherPostFlushQueueKey].push(fn);
        break;
      default:
        assert(false, `flush must be one of ["post", "pre", "sync"], but got ${mode}`);
        break;
    }
  }
}

function createSingleSourceWatcher<T>(
  vm: ComponentInstance,
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

  // `callbackRef` is used to handle firty sync callbck.
  // The subsequent callbcks will redirect to `flush`.
  let callbackRef = (n: T, o: T) => {
    callbackRef = flush;

    if (!options.lazy) {
      cb(n, o);
    } else {
      flush(n, o);
    }
  };

  const flushMode = options.flush;
  const flush =
    flushMode === 'sync'
      ? (n: T, o: T) => cb(n, o)
      : (n: T, o: T) => {
          scheduleFlush(
            vm,
            () => {
              cb(n, o);
            },
            flushMode
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
      sync: flushMode === 'sync',
    }
  );
}

function createMuiltSourceWatcher<T>(
  vm: ComponentInstance,
  sources: Array<watchedValue<T>>,
  cb: watcherCallBack<T[]>,
  options: WatcherOption
): () => void {
  const watcherContext: Array<WatcherContext<T>> = [];
  const execCallback = () => {
    cb.apply(
      vm,
      watcherContext.reduce<[T[], T[]]>(
        (acc, ctx) => {
          const newVal: T = (ctx.value = (ctx.value === INIT_VALUE
            ? ctx.getter()
            : ctx.value) as any);
          const oldVal: T = (ctx.oldValue === INIT_VALUE ? newVal : ctx.oldValue) as any;
          ctx.oldValue = newVal;
          acc[0].push(newVal);
          acc[1].push(oldVal);
          return acc;
        },
        [[], []]
      )
    );
  };
  const stop = () => watcherContext.forEach(ctx => ctx.watcherStopHandle());

  let execCallbackAfterNumRun: false | number = options.lazy ? false : sources.length;
  // `callbackRef` is used to handle firty sync callbck.
  // The subsequent callbcks will redirect to `flush`.
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

  let pendingCallback = false;
  const flushMode = options.flush;
  const flush =
    flushMode === 'sync'
      ? execCallback
      : () => {
          if (!pendingCallback) {
            pendingCallback = true;
            vm.$nextTick(() => {
              scheduleFlush(
                vm,
                () => {
                  pendingCallback = false;
                  execCallback();
                },
                flushMode
              );
            });
          }
        };

  sources.forEach(source => {
    let getter: () => T;
    if (isWrapper<T>(source)) {
      getter = () => source.value;
    } else {
      getter = source as () => T;
    }
    const watcherCtx = {
      getter,
      value: INIT_VALUE,
      oldValue: INIT_VALUE,
    } as WatcherContext<T>;
    // must push watcherCtx before create watcherStopHandle
    watcherContext.push(watcherCtx);

    watcherCtx.watcherStopHandle = vm.$watch(
      getter,
      (n: T, o: T) => {
        watcherCtx.value = n;
        // only update oldValue at frist, susquent updates at execCallback
        if (watcherCtx.oldValue === INIT_VALUE) {
          watcherCtx.oldValue = o;
        }
        callbackRef();
      },
      {
        immediate: !options.lazy,
        deep: options.deep,
        // @ts-ignore
        // always set to true, so we can fully control the schedule
        sync: true,
      }
    );
  });

  return stop;
}

export function watch<T = any>(
  source: watchedValue<T>,
  cb: watcherCallBack<T>,
  options?: Partial<WatcherOption>
): () => void;
export function watch<T = any>(
  source: Array<watchedValue<T>>,
  cb: watcherCallBack<T[]>,
  options?: Partial<WatcherOption>
): () => void;
export function watch<T = any>(
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
    if (!fallbackVM) {
      fallbackVM = createComponentInstance(getCurrentVue());
    }
    vm = fallbackVM;
  } else if (!hasWatchEnv(vm)) {
    installWatchEnv(vm);
  }

  if (isArray(source)) {
    return createMuiltSourceWatcher(vm, source, cb as watcherCallBack<T[]>, opts);
  }
  return createSingleSourceWatcher(vm, source, cb as watcherCallBack<T>, opts);
}
