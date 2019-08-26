import { ComponentInstance } from '../component';
import { Ref, isRef } from '../reactivity';
import { assert, logError, noopFn } from '../utils';
import { createComponentInstance } from '../helper';
import { getCurrentVM, getCurrentVue } from '../runtimeContext';
import { WatcherPreFlushQueueKey, WatcherPostFlushQueueKey } from '../symbols';

type CleanupRegistrator = (invalidate: () => void) => void;

type SimpleEffect = (onCleanup: CleanupRegistrator) => void;

type StopHandle = () => void;

type WatcherCallBack<T> = (newVal: T, oldVal: T, onCleanup: CleanupRegistrator) => void;

type WatcherSource<T> = Ref<T> | (() => T);

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

function queueFlushJob(vm: any, fn: () => void, mode: Exclude<FlushMode, 'sync'>) {
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

function createWatcher(
  vm: ComponentInstance,
  source: WatcherSource<unknown> | WatcherSource<unknown>[] | SimpleEffect,
  cb: WatcherCallBack<any> | null,
  options: WatcherOption
): () => void {
  const flushMode = options.flush;
  let cleanup: () => void;
  const registerCleanup: CleanupRegistrator = (fn: () => void) => {
    cleanup = () => {
      try {
        fn();
      } catch (error) {
        logError(error, vm, 'onCleanup()');
      }
    };
  };

  // effect watch
  if (cb === null) {
    const getter = () => (source as SimpleEffect)(registerCleanup);
    // cleanup before running getter again
    const runBefore = () => {
      if (cleanup) {
        cleanup();
      }
    };

    if (flushMode === 'sync') {
      return vm.$watch(getter, noopFn, {
        immediate: true,
        deep: options.deep,
        // @ts-ignore
        sync: true,
        before: runBefore,
      });
    }

    let stopRef: Function;
    let hasEnded: boolean = false;
    const doWatch = () => {
      if (hasEnded) return;

      stopRef = vm.$watch(getter, noopFn, {
        immediate: false,
        deep: options.deep,
        // @ts-ignore
        before: runBefore,
      });
    };

    /* without a current active instance, ignore pre|post mode */
    if (vm === fallbackVM) {
      vm.$nextTick(doWatch);
    } else {
      queueFlushJob(vm, doWatch, flushMode);
    }

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

  const applyCb = (n: any, o: any) => {
    // cleanup before running cb again
    if (cleanup) {
      cleanup();
    }

    cb(n, o, registerCleanup);
  };

  const callback =
    flushMode === 'sync' ||
    /* without a current active instance, ignore pre|post mode */
    vm === fallbackVM
      ? applyCb
      : (n: any, o: any) =>
          queueFlushJob(
            vm,
            () => {
              applyCb(n, o);
            },
            flushMode
          );

  // `shiftCallback` is used to handle dirty sync effect.
  // The subsequent callbacks will redirect to `callback`.
  let shiftCallback = (n: any, o: any) => {
    shiftCallback = callback;
    applyCb(n, o);
  };

  return vm.$watch(getter, options.lazy ? callback : shiftCallback, {
    immediate: !options.lazy,
    deep: options.deep,
    // @ts-ignore
    sync: flushMode === 'sync',
  });
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
  cb: (newValues: MapSources<T>, oldValues: MapSources<T>, onCleanup: CleanupRegistrator) => any,
  options?: Partial<WatcherOption>
): StopHandle;
export function watch(
  source: WatcherSource<unknown> | WatcherSource<unknown>[] | SimpleEffect,
  cb?: Partial<WatcherOption> | WatcherCallBack<any>,
  options?: Partial<WatcherOption>
): StopHandle {
  let callback: WatcherCallBack<unknown> | null = null;
  if (typeof cb === 'function') {
    // source watch
    callback = cb as WatcherCallBack<unknown>;
  } else {
    // effect watch
    options = cb as Partial<WatcherOption>;
    callback = null;
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

  return createWatcher(vm, source, callback, opts);
}
