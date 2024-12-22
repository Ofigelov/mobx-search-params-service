import { objectKeys } from "../objectKeys";
import { isStrictEqual } from "remeda";

/**
 * утилита получения разницы между двумя объектами одного типа,
 */
export const objDifference = <T extends object>(
  // объект с изменениями
  changedData: T,
  // исходный объект
  initialData: T,
): T => {
  const res = {} as T;

  objectKeys({ ...changedData, ...initialData }).forEach((key) => {
    if (!isStrictEqual(changedData?.[key], initialData?.[key])) {
      if (typeof changedData[key] === "object") {
        res[key] = objDifference(
          changedData[key] as object,
          initialData[key] as object,
        ) as T[keyof T];
      } else {
        res[key] = changedData[key];
      }
    }
  });

  return res;
};
