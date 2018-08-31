export interface IRect {
  height: number;
  width: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface IScroll {
  y: number;
  yTurn: number;
  yDTurn: number;
  isScrollingDown: boolean;
  isScrollingUp: boolean;
}

export type TRenderChildren<O> =
  | React.ReactNode
  | ((options: O) => React.ReactNode);

export interface IStickyComponentProps<R> {
  children?: TRenderChildren<R>;
  className?: string;
  style?: React.CSSProperties;

  disableHardwareAcceleration?: boolean;
  disabled?: boolean;
  stickyProps?: {
    style?: React.CSSProperties;
  };

  updateStickyOffset?: (offset: number) => void;
  stickyOffset: number;
}
