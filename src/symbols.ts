import { hasSymbol } from './utils';

function createSymbol(name: string): string {
  return hasSymbol ? (Symbol.for(name) as any) : name;
}

export const StateKey = createSymbol('vubel.key.state');
