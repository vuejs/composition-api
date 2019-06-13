import { VueConstructor } from 'vue';
import { IWrapper } from '../types/lib';
import { getCurrentVM, compoundComputed, isWrapper } from '../helper';
import { currentVue as Vue } from '../runtimeContext';
import ComputedWrapper from '../wrappers/ComputedWrapper';
import { isArray } from '../utils';

const initValue = {};
type InitValue = typeof initValue;
type watcherCallBack<T> = (newVal: T, oldVal: T) => void;
type watchedValue<T> = IWrapper<T> | (() => T);
interface WatcherOption {
  lazy?: boolean;
  deep?: boolean;
}
interface WatcherContext<T> {
  value: T | InitValue;
  oldValue: T | InitValue;
  watcherStopHandle: Function;
}

function createSingleSourceWatcher<T>(
  vm: InstanceType<VueConstructor>,
  source: watchedValue<T>,
  cb: watcherCallBack<T>,
  options: WatcherOption
) {
  let getter: () => T;
  if (isWrapper<T>(source)) {
    getter = () => source.value;
  } else {
    getter = source as () => T;
  }
  return vm.$watch(getter, cb, {
    immediate: !options.lazy,
    deep: options.deep,
  });
}

function createMuiltSourceWatcher<T>(
  vm: InstanceType<VueConstructor>,
  sources: Array<watchedValue<T>>,
  cb: watcherCallBack<T[]>,
  options: WatcherOption
) {
  let execCallbackAfterNumRun: false | number = options.lazy ? false : sources.length;
  let pendingCallback = false;
  const watcherContext: WatcherContext<T>[] = [];

  function execCallback() {
    cb.apply(vm, watcherContext.map(ctx => [
      ctx.value,
      ctx.oldValue === initValue ? ctx.value : ctx.oldValue,
    ]) as [T[], T[]]);
  }
  function stop() {
    watcherContext.forEach(ctx => ctx.watcherStopHandle());
  }

  sources.forEach(source => {
    let getter: () => T;
    if (isWrapper<T>(source)) {
      getter = () => source.value;
    } else {
      getter = source as () => T;
    }
    const watcherCtx: WatcherContext<T> = {
      value: initValue,
      oldValue: initValue,
      watcherStopHandle: vm.$watch(
        getter,
        (n: T, o: T) => {
          watcherCtx.value = n;
          watcherCtx.oldValue = o;

          if (execCallbackAfterNumRun !== false) {
            if (--execCallbackAfterNumRun === 0) {
              execCallbackAfterNumRun = false;
              execCallback();
            }
          } else if (!pendingCallback) {
            pendingCallback = true;
            // execCallback should get call once in a watcher flush cycyle
            Vue.nextTick(() => {
              pendingCallback = false;
              execCallback();
            });
          }
        },
        {
          immediate: !options.lazy,
          deep: options.deep,
        }
      ),
    };
    watcherContext.push(watcherCtx);
  });

  return stop;
}

export function watcher<T>(
  source: watchedValue<T> | Array<watchedValue<T>>,
  cb: watcherCallBack<T> | watcherCallBack<T[]>,
  options: WatcherOption = {}
) {
  const vm = getCurrentVM('state');
  if (isArray(source)) {
    return createMuiltSourceWatcher(vm, source, cb as watcherCallBack<T[]>, options);
  }
  return createSingleSourceWatcher(vm, source, cb as watcherCallBack<T>, options);
}

export function computed<T>(read: () => T, write?: (x: T) => void): IWrapper<T> {
  const computedHost = compoundComputed({
    $$state: write
      ? {
          get: read,
          set: write,
        }
      : read,
  });

  return new ComputedWrapper({
    read: () => computedHost.$$state,
    write: (v: T) => {
      computedHost.$$state = v;
    },
  });
}
