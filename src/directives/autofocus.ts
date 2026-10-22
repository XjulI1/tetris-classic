import type { Directive } from 'vue'

/** Focuses the element as soon as it is inserted, unlike the `autofocus` attribute which only applies on page load. */
export const vAutofocus: Directive<HTMLElement> = {
  mounted: (element) => element.focus({ preventScroll: true }),
}
