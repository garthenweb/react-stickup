import * as React from 'react';
import {
  ObserveViewport,
  IRect,
  IScroll,
  IDimensions,
} from 'react-viewport-utils';
import compose from 'recompose/compose';

import { connect as connectStickyScrollUpProvider } from './StickyScrollUpProvider';
import StickyElement from './StickyElement';
import { TRenderChildren } from './types';
import { shallowEqual } from 'recompose';

interface IOwnProps {
  defaultOffsetTop?: number;
  disableHardwareAcceleration?: boolean;
  disableResizing?: boolean;
  disabled?: boolean;
  stickyProps?: {};
  style?: React.CSSProperties;
}

interface IProps extends IOwnProps {
  updateStickyOffset: (offset: number) => void;
}

interface IState {
  isRecalculating: boolean;
  styles: React.CSSProperties;
  stickyHeight: number | null;
  stickyWidth: number | null;
  stickyOffset: number | null;
  clientSize: string | null;
}

const calcPositionStyles = (
  rect: IRect,
  scroll: IScroll,
  { offsetTop = 0 },
): React.CSSProperties => {
  const rectTop = Math.round(rect.top);
  if (scroll.isScrollingDown) {
    // disable sticky mode above the top offset while scrolling down
    if (rectTop > 0 && scroll.y < offsetTop) {
      return {
        position: 'absolute',
        top: 0,
      };
    }

    // element is visible and scrolls down
    return {
      position: 'absolute',
      top: Math.max(Math.floor(scroll.y - offsetTop + rect.top), 0),
    };
  }

  const isTopVisible = rectTop >= 0;
  const isBottomVisible = rectTop + rect.height <= 0;
  // element is visible and scrolls up
  if (!isTopVisible && !isBottomVisible) {
    return {
      position: 'absolute',
      top: Math.floor(scroll.y - offsetTop + rect.top),
    };
  }

  // disable sticky mode above the top offset while scrolling up
  if (scroll.y <= offsetTop) {
    return {
      position: 'absolute',
      top: 0,
    };
  }

  if (scroll.yDTurn === 0) {
    // scroll direction changed from down to up and the element was not visible
    if (isBottomVisible) {
      return {
        position: 'absolute',
        top: scroll.yTurn - offsetTop - rect.height,
      };
    }

    // scroll direction changed from down to up and the element was fully visible
    return {
      position: 'absolute',
      top: Math.max(Math.floor(scroll.y - offsetTop), 0),
    };
  }

  // set sticky
  return {
    position: 'fixed',
    top: 0,
  };
};

class StickyScrollUp extends React.PureComponent<IProps, IState> {
  private stickyRef: React.RefObject<any> = React.createRef();

  static defaultProps = {
    defaultOffsetTop: 0,
    disableHardwareAcceleration: false,
    disableResizing: false,
    style: {},
  };

  state: IState = {
    styles: {},
    isRecalculating: false,
    stickyHeight: null,
    stickyWidth: null,
    stickyOffset: null,
    clientSize: null,
  };

  getStickyStyles(stickyRect: IRect, scroll: IScroll) {
    const styles = calcPositionStyles(stickyRect, scroll, {
      offsetTop: this.props.defaultOffsetTop,
    });

    if (!this.props.disableHardwareAcceleration) {
      styles.transform = `translateZ(0)`;
      styles.willChange = 'position, top, transform';
    }

    return styles;
  }

  handleViewportUpdate = ({
    scroll,
    dimensions,
  }: {
    scroll: IScroll;
    dimensions: IDimensions;
  }) => {
    const stickyRect = this.stickyRef.current.getBoundingClientRect();
    const nextOffset = Math.max(stickyRect.bottom, 0);
    if (
      this.props.updateStickyOffset &&
      this.state.stickyOffset !== nextOffset
    ) {
      this.props.updateStickyOffset(nextOffset);
    }

    const styles = this.getStickyStyles(stickyRect, scroll);
    const stateStyles = this.state.styles;
    const nextClientSize = `${dimensions.width}`;
    const shouldRecalculate =
      !this.props.disableResizing && this.state.clientSize !== nextClientSize;

    this.setState(
      {
        styles: shallowEqual(styles, stateStyles) ? stateStyles : styles,
        stickyWidth: stickyRect.width,
        stickyHeight: stickyRect.height,
        stickyOffset: nextOffset,
        clientSize: nextClientSize,
        isRecalculating: shouldRecalculate,
      },
      () => {
        if (shouldRecalculate) {
          this.handleViewportUpdate({ scroll, dimensions });
        }
      },
    );
  };

  render() {
    const { stickyProps, children, disabled, style } = this.props;
    const { styles, stickyHeight, stickyWidth, isRecalculating } = this.state;
    const isActive = !disabled && !isRecalculating;
    const containerStyle: React.CSSProperties = isActive
      ? {
          position: 'relative',
          height: stickyHeight,
          width: stickyWidth,
          ...style,
        }
      : null;
    return (
      <>
        <div style={containerStyle}>
          <StickyElement<TRenderChildren<undefined>>
            forwardRef={this.stickyRef}
            positionStyle={styles}
            disabled={!isActive}
            children={children}
            {...stickyProps}
          />
        </div>
        <ObserveViewport onUpdate={this.handleViewportUpdate} />
      </>
    );
  }
}

export default compose<IOwnProps, IOwnProps>(connectStickyScrollUpProvider())(
  StickyScrollUp,
);
