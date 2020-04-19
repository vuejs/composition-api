import { watchEffect } from './watch';

export function isEffect(fn: any): fn is ReactiveEffect {
  return fn && fn._isEffect === true;
}

export interface ReactiveEffect<T = any> {
  // (...args: any[]): T;
  (): T;
  _isEffect: true;
  id: number;
  active: boolean;
  raw: () => T;
  // deps: Array<Dep>;
  // options: ReactiveEffectOptions;
  options: any;
}
let uid = 0;

export function effect<T = any>(
  fn: () => T,
  options: any = {} //ReactiveEffectOptions = EMPTY_OBJ
): ReactiveEffect<T> {
  if (isEffect(fn)) {
    fn = fn.raw;
  }
  // const effect = createReactiveEffect(fn, options);
  // if (!options.lazy) {
  //   effect();
  // }
  // return effect;

  // hacky stuff
  const effect: ReactiveEffect = () => {
    return fn();
  };

  watchEffect(fn, {
    deep: true,
    flush: 'sync',
  });

  if (!options.lazy) {
    effect();
  }

  effect.id = uid++;
  effect._isEffect = true;
  effect.active = true;
  effect.raw = fn;
  // effect.deps = [];
  effect.options = options;
  return effect;
}
