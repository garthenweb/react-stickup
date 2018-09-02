export type TRenderChildren<O> =
  | React.ReactNode
  | ((options: O) => React.ReactNode);

export interface IStickyComponentProps<R> {
  children?: TRenderChildren<R>;
  className?: string;
  style?: React.CSSProperties;
  disableHardwareAcceleration?: boolean;
  disabled?: boolean;
  disableResizing?: boolean;
  stickyProps?: {};
}
