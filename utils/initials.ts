// Up to two capital letters from a name, for the heraldic crest.
export function initialsOf(name: string) {
  return name.split(/[\s_-]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}
