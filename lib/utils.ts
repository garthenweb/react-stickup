export const supportsWillChange = (() => {
  const isBrowser =
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    document.documentElement;
  if (!isBrowser) {
    return false;
  }
  return 'willChange' in document.documentElement.style;
})();
