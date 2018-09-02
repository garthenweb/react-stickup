import * as React from 'react';
import { connectViewportScroll, IScroll, IRect, IDimensions } from 'react-viewport-utils';

import { connect as connectStickyOffsetUpdater, IInjectedProps as IStickyInjectedProps } from './StickyScrollUpProvider';
import Placeholder from './Placeholder';
import StickyElement from './StickyElement';

import {
  IStickyComponentProps,
  TRenderChildren,
} from './types';

interface IViewportInjectedProps {
  scroll: IScroll;
  dimensions: IDimensions;
}

interface IOwnProps extends IStickyComponentProps<{}> {
  defaultOffsetTop?: number;
}

interface IProps extends IViewportInjectedProps, IStickyInjectedProps, IOwnProps {}

const calcPositionStyles = (
  rect: IRect,
  scroll: IScroll,
  { offsetTop = 0 },
): React.CSSProperties => {
  if (scroll.isScrollingDown) {
    if (rect.top > 0 && scroll.y < offsetTop) {
      return {
        position: 'absolute',
        top: 0,
      };
    }

    return {
      position: 'absolute',
      top: Math.max(scroll.y - offsetTop + rect.top, 0),
    };
  }

  const isTopVisible = rect.top >= 0;
  const isBottomVisible = rect.top + rect.height <= 0;
  if (!isTopVisible && !isBottomVisible) {
    return {
      position: 'absolute',
      top: scroll.y - offsetTop + rect.top,
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

class StickyScrollUp extends React.PureComponent<IProps> {
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

  renderSticky(stickyRect: IRect | null) {
    const { stickyProps, children, disabled } = this.props;
    const styles = this.getStickyStyles(stickyRect);

    return (
      <StickyElement<TRenderChildren<undefined>>
        forwardRef={this.stickyRef}
        positionStyle={styles}
        disabled={disabled}
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
      >
        {r => this.renderSticky(r)}
      </Placeholder>
    );
  }
}

export default connectViewportScroll()(
  connectStickyOffsetUpdater()<IOwnProps>(StickyScrollUp)
);
