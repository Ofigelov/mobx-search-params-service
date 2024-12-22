import { objectKeys } from "../objectKeys";

/**
 * утилита, удаляющая из объекта пустые поля.
 * пустыми считаются значения: '', undefined, null, false, [], {}
 */
export const removeEmptyFieldFormObject = <T extends {}>(
  obj: T,
  includeEmptyString: boolean = false,
): Partial<T> => {
  const clone = Object.assign({}, obj) as Partial<T>;

  objectKeys(clone).forEach((key) => {
    const value = clone[key];

    if (
      (!includeEmptyString && value === "") ||
      value === undefined ||
      value === null ||
      value === false ||
      (Array.isArray(value) && (value as Array<unknown>).length === 0) ||
      (typeof value === "object" && Object.keys(value).length === 0)
    ) {
      delete clone[key];
    }
  });

  return clone;
};
