export type RegExpSource = Pick<RegExp, "source">;

const _source = (arg: string | RegExpSource) =>
  typeof arg === "string"
    ? arg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // escape string
    : arg.source;

export const tag = (
  literals: TemplateStringsArray,
  ...substitutions: ReadonlyArray<string | RegExpSource>
) => {
  const subpatterns = substitutions.map((sub) => `(?:${_source(sub)})`);
  return new RegExp(String.raw(literals, ...subpatterns));
};

export const union = (
  strings: ReadonlyArray<string | RegExpSource>,
): RegExpSource => ({
  source: strings.map(_source).join("|"),
});
