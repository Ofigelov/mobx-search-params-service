import { describe, expect, it } from 'vitest';

import { objectKeys } from './objectKeys';

describe('objectKeys', () => {
  it('Вызов функции возвращает массив ключей объекта', () => {
    const sut = objectKeys({ foo: 'bar' });

    expect(sut).toStrictEqual(['foo']);
  });
});
