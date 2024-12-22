import { describe, expect, it } from 'vitest';

import { objDifference } from './objDifference';

const a = { foo: 'bar', data: 't' };
const b = { foo: 'bar', data: 'x' };
const c = { ...a, baz: a };
const d = { ...b, baz: b };

describe('objDifference tests', () => {
  it('Вызов функции возвращает разницу между переданными элементами', () => {
    const result = objDifference(a, b);

    expect(result).toStrictEqual({ data: 't' });
  });

  it('Вызов функции возвращает разницу между переданными элементами, при сравнении сложных элементов', () => {
    const result = objDifference(c, d);

    expect(result).toStrictEqual({ data: 't', baz: { data: 't' } });
  });
});
