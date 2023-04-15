export const tag = (
  literals: TemplateStringsArray,
  ...substitutions: RegExp[]
) => new RegExp(String.raw(literals, ...substitutions.map((re) => re.source)));
