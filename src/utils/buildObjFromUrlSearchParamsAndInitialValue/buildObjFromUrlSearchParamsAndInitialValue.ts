export type ValueValidator<T> = Record<keyof T, (value: unknown) => boolean>;

/**
 * Функция построения объекта сформированного на базе переданного URLSearchParams и параметров по умолчанию. При не совпадении ключей из параметров по умолчанию к URLSearchParams, пара ключ-значение не попадает в финальный объект.
 * @param params - Текущее состояние URLSearchParams.
 * @param source - Параметры по умолчанию, на основе которых производится сопоставление ключей которые должны присуствовать в возвращемом объекте.
 * @param validator - метод для проверки валидности значений квери параметров
 */

export const buildObjFromUrlSearchParamsAndInitialValue = <T extends {}>(
  params: URLSearchParams,
  source: T,
  validator: ValueValidator<T>,
) => {
  let result: Partial<T> = { ...source };

  params.forEach((val, key) => {
    let currVal;

    try {
      currVal = JSON.parse(val);
    } catch (e) {
      if (typeof val === "string") {
        currVal = val;
      }
    }

    if (validator[key as keyof T]?.(currVal)) {
      result[key as keyof T] = currVal;
    }
  });

  return result;
};
