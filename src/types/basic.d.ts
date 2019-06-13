export type UnknownObject = { [x: string]: any };

export type Class<T = unknown> = new (...arguments_: any[]) => T;
