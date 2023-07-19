export type RegExpSource = Pick<RegExp, "source">;

const _source = (arg: string | RegExpSource) =>
  typeof arg === "string"
    ? arg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // escape string
    : arg.source.replace(/^\^|\$$/g, "");

export const tag = (flags = "") =>
(
  literals: TemplateStringsArray,
  ...substitutions: ReadonlyArray<string | RegExpSource>
) => {
  const subpatterns = substitutions.map((sub) => `(?:${_source(sub)})`);
  return new RegExp(String.raw(literals, ...subpatterns), flags);
};

export const union = (
  strings: ReadonlyArray<string | RegExpSource>,
): RegExpSource => ({
  source: strings.map(_source).join("|"),
});
