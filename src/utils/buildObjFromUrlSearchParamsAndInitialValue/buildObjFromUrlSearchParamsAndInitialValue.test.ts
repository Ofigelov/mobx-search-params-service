import { describe, expect, it } from 'vitest';

import {
  checkTypeOnArray,
  checkTypeOnBoolean,
  checkTypeOnNumber,
  checkTypeOnObject,
  checkTypeOnString,
} from '../../filter';

import { buildObjFromUrlSearchParamsAndInitialValue } from './buildObjFromUrlSearchParamsAndInitialValue';

describe('buildObjFromUrlSearchParamsAndInitialValue test', () => {
  const filter: Partial<Record<string, unknown>> = {
    string: 'test',
    number: 1,
    array: ['321', '123', '312'],
    boolean: false,
    object: {
      key: 'value',
    },
  };

  const validator = {
    string: checkTypeOnString,
    guid: checkTypeOnString,
    number: checkTypeOnNumber,
    array: checkTypeOnArray,
    boolean: checkTypeOnBoolean,
    object: checkTypeOnObject,
  };

  it('Возврат пустого объекта', () => {
    const result = buildObjFromUrlSearchParamsAndInitialValue(
      new URLSearchParams(''),
      {},
      validator,
    );

    expect(result).toEqual({});
  });

  it('Возврат объекта идентичного базовому', () => {
    const result = buildObjFromUrlSearchParamsAndInitialValue(
      new URLSearchParams(
        '?string="test"&number=1&array=["321","123","312"]&boolean=false&object={"key": "value"}',
      ),
      {},
      validator,
    );

    expect(result).toEqual(filter);
  });

  it('Гуид как строка', () => {
    const result = buildObjFromUrlSearchParamsAndInitialValue(
      new URLSearchParams('?guid=65053180-5adc-473f-94ed-7210304a0ab4'),
      {},
      validator,
    );

    expect(result).toEqual({ guid: '65053180-5adc-473f-94ed-7210304a0ab4' });
  });

  it('Возврат объекта с игнорированием отсутвующих/отличающихся ключей в ините', () => {
    const shrunkFilter = { ...filter };

    delete shrunkFilter.object;
    shrunkFilter.array = false;

    const result = buildObjFromUrlSearchParamsAndInitialValue(
      new URLSearchParams(
        '?string="test"&number=1&array=["321","123","312"]&boolean=false&object={"key": "value"}&foo="bar"',
      ),
      shrunkFilter,
      validator,
    );

    expect(result).toEqual(filter);
  });
});
