import * as React from 'react';
import { TRenderChildren } from './types';
import shallowEqual from 'recompose/shallowEqual';

interface IProps<R> {
  disabled: boolean;
  renderArgs?: R;
  children: TRenderChildren<R>;
  forwardRef?: React.RefObject<any>;
  style?: React.CSSProperties;
  positionStyle?: React.CSSProperties;
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

class StickyElement<R extends {}> extends React.Component<IProps<R>> {
  shouldComponentUpdate(nextProps: IProps<R>) {
    const { positionStyle, style, renderArgs, ...rest } = this.props;
    const {
      positionStyle: nextPositionStyle,
      style: nextStyle,
      renderArgs: nextRenderArgs,
      ...nextRest
    } = nextProps;

    if (!shallowEqual(positionStyle, nextPositionStyle)) {
      return true;
    }

    if (!shallowEqual(renderArgs, nextRenderArgs)) {
      return true;
    }

    if (!shallowEqual(style, nextStyle)) {
      return true;
    }

    if (!shallowEqual(rest, nextRest)) {
      return true;
    }

    return false;
  }

  render() {
    const {
      children,
      forwardRef,
      style: overrideStyles = {},
      positionStyle = {},
      disabled,
      renderArgs,
      ...props
    } = this.props;

    const style: React.CSSProperties = !disabled
      ? { ...baseStyles, ...positionStyle, ...overrideStyles }
      : {};

    if (style.transform) {
      Object.assign(style, prefixTransform(style.transform));
    }

    return (
      <div ref={forwardRef} style={style} {...props}>
        {typeof children === 'function' ? children(renderArgs) : children}
      </div>
    );
  }
}

export default StickyElement;
