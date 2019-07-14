import { IPositionStyles } from './types';

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

export const shallowEqualPositionStyles = (
  a: IPositionStyles,
  b: IPositionStyles,
) => {
  if (a === b) {
    return true;
  }
  if (a.position !== b.position) {
    return false;
  }
  if (a.top !== b.top) {
    return false;
  }
  if (a.transform !== b.transform) {
    return false;
  }
  if (a.willChange !== b.willChange) {
    return false;
  }
  return true;
};
