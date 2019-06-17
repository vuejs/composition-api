import { hasSymbol } from './utils';

function createSymbol(name: string): string {
  return hasSymbol ? (Symbol.for(name) as any) : name;
}

export const WatcherPreFlushQueueKey = createSymbol('vfa.key.preFlushQueue');
export const WatcherPostFlushQueueKey = createSymbol('vfa.key.postFlushQueue');
