import { action, computed, makeObservable, observable } from "mobx";
import {
  buildObjFromUrlSearchParamsAndInitialValue,
  objDifference,
  objectKeys,
  removeEmptyFieldFormObject,
  ValueValidator,
} from "./utils";

/**
 * Метод для применения измененного searchParams к url браузера
 */
type SetSearchParams = (params: URLSearchParams) => void;

/**
 * Стор для работы с фильтрами
 */
export class SearchParamsService<T extends {}> {
  /**
   * Примененные параметры фильтров
   */
  private internal: Partial<T>;

  constructor(
    /**
     * текущее значение параметров, предполагается получение значения от роутер сервиса (react-router, nextjs router)
     */
    private searchParams: URLSearchParams,
    /**
     * Метод для применения измененного searchParams к url браузера
     */
    private readonly setSearchParams: SetSearchParams,
    /**
     * валидатор значений
     */
    private validator: ValueValidator<T>,
    /**
     * Инит значения
     */
    private readonly initial: T,
    /**
     * Сет фильтров, которые нужны для счета и отображения в UI.
     */
    private readonly countable: Set<string>,
    /**
     * массив фильтров, которые должны остаться, после вызова метода reset
     */
    private readonly nonResetable?: string[],
  ) {
    this.internal = removeEmptyFieldFormObject(
      buildObjFromUrlSearchParamsAndInitialValue(
        this.searchParams,
        this.initial,
        this.validator,
      ),
    ) as unknown as T;

    makeObservable(this as ThisType<this>, {
      updateUrl: action,
      reset: action,
      apply: action,
      count: computed,
      isUrlHasDifferenceWithFilters: computed,
      data: computed,
      internal: observable,
    });
  }

  /**
   * метод для обновления урла соответсвенно текущему значению фильтра
   */
  private updateUrl = () => {
    [...this.searchParams.keys()].forEach((key) => {
      this.searchParams.delete(key);
    });

    objectKeys(this.internal).forEach((key) => {
      const value = this.internal[key];

      // если значение пустое
      if (
        value !== undefined &&
        value !== "" &&
        value !== null &&
        value !== false
      ) {
        this.searchParams.set(String(key), JSON.stringify(value));
      }
    });

    // устанавливаем урл с обновленным searchParams
    this.setSearchParams(this.searchParams);
  };

  /**
   * метод сброса фильтров, предполагается использование в UI
   */
  public reset = () => {
    // создаем объект, для накопления фильтров, которые не должны быть сброшены
    const nonResetableData: Partial<T> = {};

    // перебираем полученный набор не сбрасываемых фильтров
    this.nonResetable?.forEach((key) => {
      // сохраняя значения из актуальных фильтров
      nonResetableData[key as keyof T] = this.internal[key as keyof T];
    });

    // собираем новый набор фильтров из текущих, инит значений, и не сбрасываемых,
    // важно соблюдать порядок наложения
    this.internal = removeEmptyFieldFormObject({
      ...this.initial,
      ...nonResetableData,
    });
  };

  /**
   * метод для применения новых фильтров
   */
  public apply = (dataFilters: Partial<T>) => {
    // собираем новые фильтры наложением переданного набора, на существующие
    this.internal = removeEmptyFieldFormObject({
      ...this.internal,
      ...dataFilters,
    }) as unknown as T;
  };

  /**
   * параметр обозначающий количество примененных фильтров,
   * относительно переданного списка разрешенных к счету
   */
  public get count() {
    return Object.keys(this.internal)
      .map((key) => this.countable?.has(key))
      .filter(Boolean).length;
  }

  /**
   * вычисляемое поле, указывающее на то, что квери параметры и фильтры не синхронизированны
   */
  private get isUrlHasDifferenceWithInternal() {
    // создаем объект фильтров из квери параметров
    const urlFilters = buildObjFromUrlSearchParamsAndInitialValue(
      this.searchParams,
      {} as T,
      this.validator,
    );

    // вычисляем разницу между параметрами из строки и в основном поле
    const difference = objDifference(urlFilters, this.internal);

    return Object.keys(difference).length > 0;
  }

  /**
   * компьютед значение фильтров
   */
  public get data() {
    if (this.isUrlHasDifferenceWithInternal) {
      this.updateUrl();
    }

    return this.internal;
  }
}
