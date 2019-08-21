import { ComponentInstance } from '../component';
import { Ref, isRef } from '../reactivity';
import { assert, noopFn } from '../utils';
import { createComponentInstance } from '../helper';
import { getCurrentVM, getCurrentVue } from '../runtimeContext';
import { WatcherPreFlushQueueKey, WatcherPostFlushQueueKey } from '../symbols';

type FnWithReturnValue<T> = () => T;
type SimpleEffect = FnWithReturnValue<void>;
type StopHandle = FnWithReturnValue<void>;
type WatcherCallBack<T> = (newVal: T, oldVal: T) => void;
type WatcherSource<T> = Ref<T> | FnWithReturnValue<T>;
type MapSources<T> = {
  [K in keyof T]: T[K] extends WatcherSource<infer V> ? V : never;
};
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

function createWatcher(
  vm: ComponentInstance,
  source: WatcherSource<unknown> | WatcherSource<unknown>[] | SimpleEffect,
  cb: WatcherCallBack<any> | null,
  options: WatcherOption
): () => void {
  const flushMode = options.flush;

  // effect watch
  if (cb === null) {
    if (flushMode === 'sync') {
      return vm.$watch(source as SimpleEffect, noopFn, {
        immediate: true,
        deep: options.deep,
        // @ts-ignore
        sync: true,
      });
    }

    let stopRef: Function;
    let hasEnded: boolean = false;
    scheduleTask(
      vm,
      () => {
        if (hasEnded) return;

        stopRef = vm.$watch(source as SimpleEffect, noopFn, {
          deep: options.deep,
        });
      },
      flushMode
    );

    return () => {
      hasEnded = true;
      stopRef && stopRef();
    };
  }

  let getter: () => any;
  if (Array.isArray(source)) {
    getter = () => source.map(s => (isRef(s) ? s.value : s()));
  } else if (isRef(source)) {
    getter = () => source.value;
  } else {
    getter = source as () => any;
  }

  const flush =
    flushMode === 'sync'
      ? cb
      : (n: any, o: any) => {
          scheduleTask(
            vm,
            () => {
              cb(n, o);
            },
            flushMode
          );
        };

  // `shiftCallback` is used to handle firty sync effect.
  // The subsequent callbcks will redirect to `flush`.
  let shiftCallback = (n: any, o: any) => {
    shiftCallback = flush;
    cb(n, o);
  };

  return vm.$watch(
    getter,
    options.lazy
      ? flush
      : (n: any, o: any) => {
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
  source: SimpleEffect,
  options?: Omit<Partial<WatcherOption>, 'lazy'>
): StopHandle;
export function watch<T = any>(
  source: WatcherSource<T>,
  cb: WatcherCallBack<T>,
  options?: Partial<WatcherOption>
): StopHandle;
export function watch<T extends WatcherSource<unknown>[]>(
  sources: T,
  cb: (newValues: MapSources<T>, oldValues: MapSources<T>) => any,
  options?: Partial<WatcherOption>
): StopHandle;
export function watch(
  source: WatcherSource<unknown> | WatcherSource<unknown>[] | SimpleEffect,
  cb?: Partial<WatcherOption> | WatcherCallBack<any>,
  options?: Partial<WatcherOption>
): StopHandle {
  let callbck: WatcherCallBack<unknown> | null = null;
  if (typeof cb === 'function') {
    // source watch
    callbck = cb as WatcherCallBack<unknown>;
  } else {
    // effect watch
    options = cb as Partial<WatcherOption>;
    callbck = null;
  }

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

  return createWatcher(vm, source, callbck, opts);
}
