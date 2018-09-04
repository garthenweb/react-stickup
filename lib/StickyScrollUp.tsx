import * as React from 'react';
import {
  connectViewportScroll,
  IScroll,
  IRect,
} from 'react-viewport-utils';
import compose from 'recompose/compose';
import mapProps from 'recompose/mapProps';
import shallowEqual from 'recompose/shallowEqual';

import {
  connect as connectStickyScrollUpProvider,
} from './StickyScrollUpProvider';
import Placeholder, { IUpdateOptions } from './Placeholder';
import StickyElement from './StickyElement';

import { IStickyComponentProps, TRenderChildren } from './types';

interface IStickyInjectedProps {
  updateStickyOffset: (offset: number) => void;
}

interface IViewportInjectedProps {
  scroll: IScroll;
}

interface IOwnProps extends IStickyComponentProps<{}> {
  defaultOffsetTop?: number;
}

interface IProps
  extends IViewportInjectedProps,
    IStickyInjectedProps,
    IOwnProps {}

const calcPositionStyles = (
  rect: IRect,
  scroll: IScroll,
  { offsetTop = 0 },
): React.CSSProperties => {
  const rectTop = Math.round(rect.top);
  if (scroll.isScrollingDown) {
    if (rectTop > 0 && scroll.y < offsetTop) {
      return {
        position: 'absolute',
        top: 0,
      };
    }

    return {
      position: 'absolute',
      top: Math.max(scroll.y - offsetTop + rectTop, 0),
    };
  }

  const isTopVisible = rectTop >= 0;
  const isBottomVisible = rectTop + rect.height <= 0;
  if (!isTopVisible && !isBottomVisible) {
    return {
      position: 'absolute',
      top: scroll.y - offsetTop + rectTop,
    };
  }

  if (scroll.y <= offsetTop) {
    return {
      position: 'absolute',
      top: 0,
    };
  }

  if (scroll.yDTurn === 0) {
    return {
      position: 'absolute',
      top: scroll.yTurn - offsetTop - rect.height,
    };
  }

  return {
    position: 'fixed',
    top: 0,
  };
};

class StickyScrollUp extends React.Component<IProps> {
  private stickyRef: React.RefObject<any>;
  static defaultProps = {
    disabled: false,
    defaultOffsetTop: 0,
    stickyProps: {
      style: {},
    },
    disableHardwareAcceleration: false,
  };

  constructor(props: IProps) {
    super(props);
    this.stickyRef = React.createRef();
  }

  shouldComponentUpdate({ scroll: nextScroll, ...nextProps }: IProps) {
    const { scroll, ...props } = this.props;
    const scrollEquals = shallowEqual(nextScroll, scroll);
    if (!scrollEquals) {
      return true;
    }
    return !shallowEqual(nextProps, props);
  }

  componentDidUpdate() {
    if (this.props.updateStickyOffset) {
      const { bottom } = this.stickyRef.current.getBoundingClientRect();
      const offset = Math.max(bottom, 0);
      this.props.updateStickyOffset(offset);
    }
  }

  getStickyStyles(stickyRect: IRect | null) {
    if (!stickyRect) {
      return {};
    }

    const styles = calcPositionStyles(stickyRect, this.props.scroll, {
      offsetTop: this.props.defaultOffsetTop,
    });

    if (!this.props.disableHardwareAcceleration) {
      Object.assign(styles, {
        transform: `translateZ(0)`,
        willChange: 'position, top, transform',
      });
    }

    return styles;
  }

  renderSticky(stickyRect: IRect | null, { isRecalculating }: IUpdateOptions) {
    const { stickyProps, children, disabled } = this.props;
    const styles = this.getStickyStyles(stickyRect);

    return (
      <StickyElement<TRenderChildren<undefined>>
        forwardRef={this.stickyRef}
        positionStyle={styles}
        disabled={disabled || isRecalculating}
        children={children}
        {...stickyProps}
      />
    );
  }

  render() {
    return (
      <Placeholder
        node={this.stickyRef}
        style={this.props.style}
        className={this.props.className}
        disabled={this.props.disabled}
        disableResizing={this.props.disableResizing}
      >
        {(rect, options) => this.renderSticky(rect, options)}
      </Placeholder>
    );
  }
}

export default compose<IOwnProps, IOwnProps>(
  connectStickyScrollUpProvider(),
  connectViewportScroll(),
  mapProps(({ dimensions, scroll, stickyOffset, ...props }) => ({
    scroll,
    ...props,
  })),
)(StickyScrollUp);
