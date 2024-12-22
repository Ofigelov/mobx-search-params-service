import { describe, expect, it, vi } from "vitest";
import { toJS } from "mobx";

const checkTypeOnBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

const checkTypeOnString = (value: unknown): value is string =>
  typeof value === "string";

const checkTypeOnArray = (value: unknown): value is unknown[] =>
  Array.isArray(value);

const checkTypeOnStringArray = (value: unknown): value is string[] =>
  checkTypeOnArray(value) && value.every(checkTypeOnString);

import { SearchParamsService } from "./SearchParamsService";

describe("SearchParamsService", () => {
  const buildInstance = ({
    searchParams = new URLSearchParams(),
    validator = {},
    countableFilters = new Set<string>([]),
    initialFilters = {},
    nonResetableFields = [] as string[],
  } = {}) => {
    const onSetSearchParams = vi.fn();
    const sut = new SearchParamsService(
      searchParams,
      onSetSearchParams,
      validator,
      initialFilters,
      countableFilters,
      nonResetableFields,
    );

    return { sut, onSetSearchParams };
  };

  it("Проверка на пустые значение", () => {
    const { sut } = buildInstance();

    expect(sut.data).toStrictEqual({});
    expect(sut.count).toBe(0);
  });

  it("Если квери параметры не содержат данные, а инит фильтры содержат, то вызывается onSetSearchParams", () => {
    const { sut, onSetSearchParams } = buildInstance({
      initialFilters: { foo: "bar" },
      validator: { foo: checkTypeOnString },
    });

    expect(sut.data).toStrictEqual({ foo: "bar" });
    expect(onSetSearchParams).toBeCalled();
  });

  it("Если квери параметры содержат данные и инит фильтры содержат, onSetSearchParams не вызывается", () => {
    const { sut, onSetSearchParams } = buildInstance({
      initialFilters: { foo: "bar" },
      searchParams: new URLSearchParams('?foo="bar"'),
      validator: { foo: checkTypeOnString },
    });

    expect(sut.data).toStrictEqual({ foo: "bar" });
    expect(onSetSearchParams).not.toBeCalled();
  });

  it("Проверка квери параметрами, если валидатора нет, то параметры игнорируются", () => {
    const { sut } = buildInstance({
      searchParams: new URLSearchParams('?foo="bar"'),
    });

    expect(sut.count).toBe(0);
    expect(toJS(sut.data)).toStrictEqual({});
  });

  it("Проверка квери параметрами, если валидатор есть, и значение параметра удовлетворяет валидатору, то параметры применяются", async () => {
    const { sut } = buildInstance({
      searchParams: new URLSearchParams('?foo="bar"&baz=true'),
      validator: { foo: checkTypeOnString },
    });

    expect(toJS(sut.data)).toStrictEqual({ foo: "bar" });
    expect(sut.count).toBe(0);
  });

  it("Проверка счетчика, если задан доступный набор фильтров для счета", async () => {
    const { sut } = buildInstance({
      initialFilters: { foo: "bar", baz: true },
      countableFilters: new Set(["foo"]),
    });

    expect(sut.count).toBe(1);
    expect(toJS(sut.data)).toStrictEqual({ foo: "bar", baz: true });
  });

  it("Проверка cовмещения квери строки и инит значений, значения квери строки должны быть приоритетнее", async () => {
    const { sut } = buildInstance({
      searchParams: new URLSearchParams('?foo="bar"'),
      validator: { foo: checkTypeOnString },
      initialFilters: { foo: "baz" },
    });

    expect(toJS(sut.data)).toStrictEqual({ foo: "bar" });
  });

  it("Проверка применения фильтров", async () => {
    const { sut, onSetSearchParams } = buildInstance({
      initialFilters: { foo: "bar" },
      validator: {
        foo: checkTypeOnString,
      },
    });

    sut.apply({ foo: "baz" });
    expect(toJS(sut.data)).toStrictEqual({ foo: "baz" });

    expect(onSetSearchParams, "111").toBeCalledWith(
      new URLSearchParams('?foo="baz"'),
    );

    sut.apply({ foo: "bar" });
    expect(toJS(sut.data)).toStrictEqual({ foo: "bar" });

    expect(onSetSearchParams, "2").toBeCalledWith(
      new URLSearchParams('?foo="bar"'),
    );
  });

  it("Фильтры сбрасываются из значения указанного к квери параметрах в инит значение", async () => {
    const { sut, onSetSearchParams } = buildInstance({
      searchParams: new URLSearchParams('?foo="bar"'),
      validator: { foo: checkTypeOnString },
      initialFilters: { foo: "baz" },
    });

    expect(toJS(sut.data)).toStrictEqual({ foo: "bar" });
    sut.reset();
    expect(toJS(sut.data)).toStrictEqual({ foo: "baz" });
    expect(onSetSearchParams).toBeCalledWith(new URLSearchParams('?foo="baz"'));
  });

  it("Фильтры сбрасываются после применения", async () => {
    const { sut, onSetSearchParams } = buildInstance({
      validator: { foo: checkTypeOnString, bar: checkTypeOnString },
    });

    sut.apply({ foo: "lorem", bar: "ipsum" });
    // имитируем считывание фильтров
    JSON.stringify(sut.data);
    sut.reset();
    // имитируем считывание фильтров
    JSON.stringify(sut.data);
    expect(onSetSearchParams).toHaveBeenLastCalledWith(new URLSearchParams());
  });

  it("Проверка сброса фильтров, с указанным списком не сбрасываемых ключей", async () => {
    const { sut, onSetSearchParams } = buildInstance({
      searchParams: new URLSearchParams('?foo="bar"&baz=true'),
      validator: { foo: checkTypeOnString, baz: checkTypeOnBoolean },
      initialFilters: { foo: "baz", baz: false },
      nonResetableFields: ["foo"],
    });

    expect(toJS(sut.data)).toStrictEqual({ foo: "bar", baz: true });
    sut.reset();
    expect(toJS(sut.data)).toStrictEqual({ foo: "bar" });
    expect(onSetSearchParams).toBeCalledWith(new URLSearchParams('?foo="bar"'));
  });

  it("Элемент фильтра сбрасывается, при установке установке значения null", () => {
    const { sut, onSetSearchParams } = buildInstance({
      searchParams: new URLSearchParams('?foo="bar"'),
      validator: { foo: checkTypeOnString },
      initialFilters: {},
      nonResetableFields: [],
    });

    sut.apply({ foo: null });
    expect(toJS(sut.data)).toStrictEqual({});
    expect(onSetSearchParams).toBeCalledWith(new URLSearchParams(""));
  });

  it("Элемент фильтра сбрасывается, при установке установке значения null при типе строковый массив", () => {
    const { sut, onSetSearchParams } = buildInstance({
      searchParams: new URLSearchParams('?foo=%5B"bar"%5D'),
      validator: { foo: checkTypeOnStringArray },
      initialFilters: {},
      nonResetableFields: [],
    });

    sut.apply({ foo: null });
    expect(toJS(sut.data)).toStrictEqual({});
    expect(onSetSearchParams).toBeCalledWith(new URLSearchParams(""));
  });

  it("Элемент фильтра сбрасывается, при установке установке значения сначала в значение строкового массива и потом в null", () => {
    const { sut, onSetSearchParams } = buildInstance({
      searchParams: new URLSearchParams(""),
      validator: { foo: checkTypeOnStringArray },
      initialFilters: {},
      nonResetableFields: [],
    });

    sut.apply({ foo: ["bar"] });
    // имитируем считывание фильтров
    JSON.stringify(sut.data);
    sut.apply({ foo: null });
    // имитируем считывание фильтров
    JSON.stringify(sut.data);
    expect(sut.data).toStrictEqual({});
    expect(onSetSearchParams).toBeCalledTimes(2);
    expect(onSetSearchParams).toHaveBeenLastCalledWith(new URLSearchParams(""));
  });
});
