import { reactive, UnwrapRef } from '../../src/reactivity';

describe('reactive', () => {
  it('should accept objects with a "value" property', () => {
    const x: UnwrapRef<{ value: string }> = reactive({ value: 'foo' });
    expect(x.value).toEqual('foo');
  });
});
