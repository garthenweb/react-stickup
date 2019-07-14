import * as React from 'react';
import { TRenderChildren, IPositionStyles } from './types';

interface IProps<R> {
  disabled: boolean;
  renderArgs?: R;
  children: TRenderChildren<R>;
  forwardRef?: React.RefObject<any>;
  style?: React.CSSProperties;
  positionStyle?: IPositionStyles;
}

const baseStyles: React.CSSProperties = {
  width: 'inherit',
};

const prefixTransform = (transform: string): React.CSSProperties => ({
  transform,
  WebkitTransform: transform,
  msTransform: transform,
  OTransform: transform,
});

const StickyElement = <R extends {}>({
  children,
  forwardRef,
  style: overrideStyles = {},
  positionStyle = {},
  disabled,
  renderArgs,
  ...props
}: IProps<R>) => {
  const style: React.CSSProperties = !disabled
    ? { ...baseStyles, ...positionStyle, ...overrideStyles }
    : {};

  if (style.transform) {
    Object.assign(style, prefixTransform(style.transform));
  }

  return (
    <div ref={forwardRef} style={style} {...props}>
      {typeof children === 'function'
        ? (children as (options: R) => React.ReactNode)(renderArgs)
        : children}
    </div>
  );
};

export default StickyElement;
