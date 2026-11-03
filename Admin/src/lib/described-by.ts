/** Points a form control at its error message, or its hint when there is no error. */
export function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}
