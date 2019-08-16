import { ComponentInstance } from '../component';
import { Ref, isRef } from '../reactivity';
import { assert, noopFn } from '../utils';
import { createComponentInstance } from '../helper';
import { getCurrentVM, getCurrentVue } from '../runtimeContext';
import { WatcherPreFlushQueueKey, WatcherPostFlushQueueKey } from '../symbols';

type WatcherFun<T> = () => T;
type watcherCallBack<T> = (newVal: T, oldVal: T) => void;
type watcherSource<T> = Ref<T> | WatcherFun<T>;
type FlushMode = 'pre' | 'post' | 'sync';
interface WatcherOption {
  lazy: boolean;
  deep: boolean;
  flush: FlushMode;
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

function scheduleTask(vm: any, fn: Function, mode: Exclude<FlushMode, 'sync'>) {
  if (vm === fallbackVM) {
    // with a current active instance, ignore flush mode
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

function createWatcher<T>(
  vm: ComponentInstance,
  source: watcherSource<T>,
  cb: watcherCallBack<T> | null,
  options: WatcherOption
): () => void {
  const flushMode = options.flush;
  let getter: () => T;
  let effect: watcherCallBack<T>;
  let autorun: boolean;

  if (cb === null) {
    autorun = true;
    effect = noopFn;
    getter = source as () => T;
  } else {
    autorun = false;
    effect = cb;
    if (isRef<T>(source)) {
      getter = () => source.value;
    } else {
      getter = source as () => T;
    }
  }

  if (autorun) {
    if (flushMode === 'sync') {
      return vm.$watch(getter, effect, {
        immediate: true,
        deep: options.deep,
        // @ts-ignore
        sync: true,
      });
    }

    let stopRef: Function;
    scheduleTask(
      vm,
      () => {
        stopRef = vm.$watch(
          getter,
          options.lazy
            ? flush
            : (n: T, o: T) => {
                shiftCallback(n, o);
              },
          {
            deep: options.deep,
          }
        );
      },
      flushMode
    );

    return () => {
      stopRef && stopRef();
    };
  }

  const flush =
    flushMode === 'sync'
      ? effect
      : (n: T, o: T) => {
          scheduleTask(
            vm,
            () => {
              effect(n, o);
            },
            flushMode
          );
        };

  // `shiftCallback` is used to handle firty sync effect.
  // The subsequent callbcks will redirect to `flush`.
  let shiftCallback = (n: T, o: T) => {
    shiftCallback = flush;
    effect(n, o);
  };

  return vm.$watch(
    getter,
    options.lazy
      ? flush
      : (n: T, o: T) => {
          shiftCallback(n, o);
        },
    {
      immediate: !options.lazy,
      deep: options.deep,
      // @ts-ignore
      sync: flushMode === 'sync',
    }
  );
}

export function watch<T = any>(
  source: WatcherFun<void>,
  options?: Omit<Partial<WatcherOption>, 'lazy'>
): () => void;
export function watch<T = any>(
  source: watcherSource<T>,
  cb: watcherCallBack<T>,
  options?: Partial<WatcherOption>
): () => void;
export function watch<T = any>(
  source: WatcherFun<void> | watcherSource<T>,
  cb?: Partial<WatcherOption> | watcherCallBack<T>,
  options?: Partial<WatcherOption>
): () => void {
  let callbck: watcherCallBack<T> | null = null;
  if (typeof source === 'function' && (arguments.length === 1 || typeof cb !== 'function')) {
    options = cb as Partial<WatcherOption>;
    callbck = null;
  } else {
    callbck = cb as watcherCallBack<T>;
  }

  const opts: WatcherOption = {
    ...{
      lazy: false,
      deep: false,
      flush: 'post',
    },
    ...(options || {}),
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

  return createWatcher(vm, source as watcherSource<T>, callbck, opts);
}
