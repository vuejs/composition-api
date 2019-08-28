export type AnyObject = Record<string | number | symbol, any>;

// Conditional returns can enforce identical types.
// See here: https://github.com/Microsoft/TypeScript/issues/27024#issuecomment-421529650
// prettier-ignore
type Equal<Left, Right> =
  (<U>() => U extends Left ? 1 : 0) extends (<U>() => U extends Right ? 1 : 0) ? true : false;

export type HasDefined<T> = Equal<T, unknown> extends true ? false : true;
