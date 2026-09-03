export type Dictionary = Record<string, string>;

export type TranslationValues = Record<string, number | string>;

export function formatTranslation(
  template: string,
  values?: TranslationValues,
) {
  if (!values) return template;

  return template.replace(/{{(\w+)}}/g, (token, key: string) =>
    key in values ? String(values[key]) : token,
  );
}

export function translate(
  dictionary: Dictionary,
  key: string,
  values?: TranslationValues,
) {
  return formatTranslation(dictionary[key] ?? key, values);
}
