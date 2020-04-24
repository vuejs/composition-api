import { ComponentInstance } from '../component';
import { Ref, isRef } from '../reactivity';
import { assert, logError, noopFn, warn } from '../utils';
import { defineComponentInstance } from '../helper';
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
  lazy: boolean; // whether or not to delay callcack invoking
  deep: boolean;
  flush: FlushMode;
}

export interface VueWatcher {
  lazy: boolean;
  get(): any;
  teardown(): void;
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

function getWatcherOption(options?: Partial<WatcherOption>): WatcherOption {
  return {
    ...{
      lazy: false,
      deep: false,
      flush: 'post',
    },
    ...options,
  };
}

function getWatcherVM() {
  let vm = getCurrentVM();
  if (!vm) {
    if (!fallbackVM) {
      fallbackVM = defineComponentInstance(getCurrentVue());
    }
    vm = fallbackVM;
  } else if (!hasWatchEnv(vm)) {
    installWatchEnv(vm);
  }
  return vm;
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

function createVueWatcher(
  vm: ComponentInstance,
  getter: () => any,
  callback: (n: any, o: any) => any,
  options: {
    deep: boolean;
    sync: boolean;
    immediateInvokeCallback?: boolean;
    noRun?: boolean;
    before?: () => void;
  }
): VueWatcher {
  const index = vm._watchers.length;
  // @ts-ignore: use undocumented options
  vm.$watch(getter, callback, {
    immediate: options.immediateInvokeCallback,
    deep: options.deep,
    lazy: options.noRun,
    sync: options.sync,
    before: options.before,
  });

  return vm._watchers[index];
}

// We have to monkeypatch the teardown function so Vue will run
// runCleanup() when it tears down the watcher on unmmount.
function patchWatcherTeardown(watcher: VueWatcher, runCleanup: () => void) {
  const _teardown = watcher.teardown;
  watcher.teardown = function(...args) {
    _teardown.apply(watcher, args);
    runCleanup();
  };
}

function createWatcher(
  vm: ComponentInstance,
  source: WatcherSource<unknown> | WatcherSource<unknown>[] | SimpleEffect,
  cb: WatcherCallBack<any> | null,
  options: WatcherOption
): () => void {
  const flushMode = options.flush;
  const isSync = flushMode === 'sync';
  let cleanup: (() => void) | null;
  const registerCleanup: CleanupRegistrator = (fn: () => void) => {
    cleanup = () => {
      try {
        fn();
      } catch (error) {
        logError(error, vm, 'onCleanup()');
      }
    };
  };
  // cleanup before running getter again
  const runCleanup = () => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  };
  const createScheduler = <T extends Function>(fn: T): T => {
    if (isSync || /* without a current active instance, ignore pre|post mode */ vm === fallbackVM) {
      return fn;
    }
    return (((...args: any[]) =>
      queueFlushJob(
        vm,
        () => {
          fn(...args);
        },
        flushMode as 'pre' | 'post'
      )) as any) as T;
  };

  // effect watch
  if (cb === null) {
    const getter = () => (source as SimpleEffect)(registerCleanup);
    const watcher = createVueWatcher(vm, getter, noopFn, {
      noRun: true, // take control the initial gettet invoking
      deep: options.deep,
      sync: isSync,
      before: runCleanup,
    });

    patchWatcherTeardown(watcher, runCleanup);

    // enable the watcher update
    watcher.lazy = false;

    const originGet = watcher.get.bind(watcher);
    if (isSync) {
      watcher.get();
    } else {
      vm.$nextTick(originGet);
    }
    watcher.get = createScheduler(originGet);

    return () => {
      watcher.teardown();
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
    runCleanup();
    cb(n, o, registerCleanup);
  };
  let callback = createScheduler(applyCb);
  if (!options.lazy) {
    const originalCallbck = callback;
    // `shiftCallback` is used to handle the first sync effect run.
    // The subsequent callbacks will redirect to `callback`.
    let shiftCallback = (n: any, o: any) => {
      shiftCallback = originalCallbck;
      applyCb(n, o);
    };
    callback = (n: any, o: any) => {
      shiftCallback(n, o);
    };
  }

  // @ts-ignore: use undocumented option "sync"
  const stop = vm.$watch(getter, callback, {
    immediate: !options.lazy,
    deep: options.deep,
    sync: isSync,
  });

  // Once again, we have to hack the watcher for proper teardown
  const watcher = vm._watchers[vm._watchers.length - 1];
  patchWatcherTeardown(watcher, runCleanup);

  return () => {
    stop();
  };
}

export function watchEffect(
  effect: SimpleEffect,
  options?: Omit<Partial<WatcherOption>, 'lazy'>
): StopHandle {
  const opts = getWatcherOption(options);
  const vm = getWatcherVM();
  return createWatcher(vm, effect, null, opts);
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
    if (process.env.NODE_ENV !== 'production') {
      warn(
        `\`watch(fn, options?)\` signature has been moved to a separate API. ` +
          `Use \`watchEffect(fn, options?)\` instead. \`watch\` now only ` +
          `supports \`watch(source, cb, options?) signature.`
      );
    }
    options = cb as Partial<WatcherOption>;
    callback = null;
  }

  const opts = getWatcherOption(options);
  const vm = getWatcherVM();

  return createWatcher(vm, source, callback, opts);
}
