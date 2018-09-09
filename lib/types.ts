export type TRenderChildren<O> =
  | React.ReactNode
  | ((options: O) => React.ReactNode);

export interface IStickyComponentProps {
  defaultOffsetTop?: number;
  disableHardwareAcceleration?: boolean;
  disableResizing?: boolean;
  disabled?: boolean;
  stickyProps?: {};
  style?: React.CSSProperties;
  className?: string;
}

export interface IStickyInjectedProps {
  stickyOffset: { top: number };
  updateStickyOffset: (offset: number) => void;
}
