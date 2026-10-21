import type { Locale } from "./locale";

/**
 * Component UI strings, one namespace per component. Each component declares
 * its defaults next to its code with `defineMessages`, and reads them with
 * `useMessages` (see TajUIProvider). Apps override any key per namespace:
 *
 *   <TajUIProvider locale="tg" messages={{ dataTable: { noData: "…" } }}>
 */
export type MessageValue = string | ((...args: never[]) => string);
export type MessageDict = Record<string, MessageValue>;

export interface MessageNamespace<T extends MessageDict> {
  namespace: string;
  locales: Record<Locale, T>;
}

export function defineMessages<T extends MessageDict>(
  namespace: string,
  locales: Record<Locale, T>,
): MessageNamespace<T> {
  return { namespace, locales };
}

/** Strings shared by many components. */
export const commonMessages = defineMessages("common", {
  ru: {
    close: "Закрыть",
    cancel: "Отмена",
    confirm: "Подтвердить",
    apply: "Применить",
    reset: "Сбросить",
    clear: "Очистить",
    save: "Сохранить",
    remove: "Удалить",
    edit: "Изменить",
    search: "Поиск…",
    clearSearch: "Очистить поиск",
    loading: "Загрузка…",
    noResults: "Ничего не найдено",
    noData: "Нет данных",
    retry: "Повторить",
    more: "Ещё",
    decrease: "Уменьшить",
    increase: "Увеличить",
    required: "Обязательное поле",
    notifications: "Уведомления",
  },
  tg: {
    close: "Пӯшидан",
    cancel: "Бекор кардан",
    confirm: "Тасдиқ кардан",
    apply: "Татбиқ кардан",
    reset: "Аз нав",
    clear: "Тоза кардан",
    save: "Нигоҳ доштан",
    remove: "Нест кардан",
    edit: "Тағйир додан",
    search: "Ҷустуҷӯ…",
    clearSearch: "Тоза кардани ҷустуҷӯ",
    loading: "Боркунӣ…",
    noResults: "Ҳеҷ чиз ёфт нашуд",
    noData: "Маълумот нест",
    retry: "Такрор кардан",
    more: "Боз",
    decrease: "Кам кардан",
    increase: "Зиёд кардан",
    required: "Майдони ҳатмӣ",
    notifications: "Огоҳиномаҳо",
  },
  en: {
    close: "Close",
    cancel: "Cancel",
    confirm: "Confirm",
    apply: "Apply",
    reset: "Reset",
    clear: "Clear",
    save: "Save",
    remove: "Remove",
    edit: "Edit",
    search: "Search…",
    clearSearch: "Clear search",
    loading: "Loading…",
    noResults: "No results",
    noData: "No data",
    retry: "Retry",
    more: "More",
    decrease: "Decrease",
    increase: "Increase",
    required: "Required",
    notifications: "Notifications",
  },
});
