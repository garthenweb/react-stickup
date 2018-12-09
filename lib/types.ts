export type TRenderChildren<O> =
  | React.ReactNode
  | ((options: O) => React.ReactNode);

export interface IStickyComponentProps {
  /**
   * By default css styles for hardware acceleration (`will-change` if supported, otherwise falls back to `transform`) are activated. This allows to turn it off.
   */
  disableHardwareAcceleration?: boolean;
  /**
   * The components will resize when the width of the window changes to adjust its height and with. This allows to turn the resizing off.
   */
  disableResizing?: boolean;
  /**
   * Allows to disable all sticky behavior. Use this in case you need to temporary disable the sticky behavior but you don't want to unmount it for performance reasons.
   */
  disabled?: boolean;
  /**
   * All properties within this object are spread directly into the sticky element within the component. This e.g. allows to add css styles by `className` or `style`.
   */
  stickyProps?: {};
  /**
   * Will be merged with generated styles of the placeholder element. It also allows to override generated styles.
   */
  style?: React.CSSProperties;
  /**
   * The class name is passed directly to the placeholder element.
   */
  className?: string;
}

export interface IStickyInjectedProps {
  stickyOffset: { top: number; height: number };
  updateStickyOffset: (offset: number, height: number) => void;
}
