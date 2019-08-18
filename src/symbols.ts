import { hasSymbol } from './utils';

function createSymbol(name: string): string {
  return hasSymbol ? (Symbol.for(name) as any) : name;
}

export const WatcherPreFlushQueueKey = createSymbol('vfa.key.preFlushQueue');
export const WatcherPostFlushQueueKey = createSymbol('vfa.key.postFlushQueue');
export const AccessControIdentifierlKey = createSymbol('vfa.key.accessControIdentifier');
export const ReactiveIdentifierKey = createSymbol('vfa.key.reactiveleIdentifier');
export const NonReactiveIdentifierKey = createSymbol('vfa.key.nonReactiveleIdentifier');

// must be a string, symbol key is ignored in reactive
export const RefKey = 'vfa.key.refKey';
