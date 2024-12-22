import { describe, expect, it } from 'vitest';

import { removeEmptyFieldFormObject } from './removeEmptyFieldFormObject';

describe('removeEmptyFieldFormObject', () => {
  it('Вызов функции возвращает пустой объект без ключей при передаче в него объекта с пустыми значениями', () => {
    const result = removeEmptyFieldFormObject({
      name: '',
      item: null,
      foo: undefined,
      user: {},
      baz: [],
      bar: false,
    });

    expect(result).toStrictEqual({});
  });

  it('Вызов функции возвращает объект, содержащий пары ключ-значение, в которых значение не является пустым', () => {
    const result = removeEmptyFieldFormObject({
      name: 'User',
      item: 'null',
      user: {
        name: 'string',
      },
      baz: [1],
      bar: true,
    });

    expect(result).toStrictEqual({
      name: 'User',
      item: 'null',
      user: {
        name: 'string',
      },
      baz: [1],
      bar: true,
    });
  });
});
