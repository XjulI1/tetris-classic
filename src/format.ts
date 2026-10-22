const numberFormat = new Intl.NumberFormat('fr-FR')

export const formatNumber = (value: number): string => numberFormat.format(value)

/** Share of cleared lines that came from tetrises, as a whole percentage. */
export const tetrisRate = (tetrises: number, lines: number): number =>
  lines === 0 ? 0 : Math.round(((tetrises * 4) / lines) * 100)
