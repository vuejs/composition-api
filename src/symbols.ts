import { hasSymbol } from './utils';

function createSymbol(name: string): string {
  return hasSymbol ? (Symbol.for(name) as any) : name;
}

export const WatcherPreFlushQueueKey = createSymbol('vfa.key.preFlushQueue');
export const WatcherPostFlushQueueKey = createSymbol('vfa.key.postFlushQueue');
export const AccessControlIdentifierKey = createSymbol('vfa.key.accessControlIdentifier');
export const ReactiveIdentifierKey = createSymbol('vfa.key.reactiveIdentifier');
export const NonReactiveIdentifierKey = createSymbol('vfa.key.nonReactiveIdentifier');

// must be a string, symbol key is ignored in reactive
export const RefKey = 'vfa.key.refKey';
