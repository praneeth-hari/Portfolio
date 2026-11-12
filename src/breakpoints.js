/*
 * Layout breakpoints shared with scripts. Media queries in src/styles cannot read
 * CSS variables, so the same numbers are written there too (see 00-tokens.css).
 * Change them in both places.
 */
export const BP = {
  tablet: 900, // layouts collapse; the pinned horizontal scroll turns into a vertical list
  phone: 640,
  narrow: 520
};

// width of the centred content track used by the pinned Work section
export const WORK_TRACK = 1240;

export const maxTablet = `(max-width: ${BP.tablet}px)`;
