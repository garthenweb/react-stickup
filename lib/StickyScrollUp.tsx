import * as React from 'react';
import { ObserveViewport, IRect, IScroll } from 'react-viewport-utils';
import { shallowEqual } from 'recompose';

import { connect as connectStickyProvider } from './StickyProvider';
import StickyElement from './StickyElement';
import StickyPlaceholder from './StickyPlaceholder';
import {
  TRenderChildren,
  IStickyComponentProps,
  IStickyInjectedProps,
} from './types';
import { supportsWillChange } from './utils';

interface IOwnProps extends IStickyComponentProps {
  children?: TRenderChildren<undefined>;
}

interface IProps extends IOwnProps, IStickyInjectedProps {}

interface IState {
  styles: React.CSSProperties;
  stickyOffset: number | null;
  stickyOffsetHeight: number;
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
    stickyOffset: null,
    stickyOffsetHeight: 0,
  };

  componentDidUpdate(prevProps: IProps, prevState: IState) {
    if (
      this.props.updateStickyOffset &&
      prevProps.disabled !== this.props.disabled
    ) {
      this.props.updateStickyOffset(
        this.props.disabled ? 0 : this.state.stickyOffset,
        this.state.stickyOffsetHeight,
      );
    }
  }

  isNearToViewport = (rect: IRect): boolean => {
    const padding = 300;
    return rect.top - padding < 0;
  };

  getStickyStyles(stickyRect: IRect, scroll: IScroll) {
    const styles = calcPositionStyles(stickyRect, scroll, {
      offsetTop: this.props.defaultOffsetTop,
    });

    if (!this.props.disableHardwareAcceleration) {
      const shouldAccelerate = this.isNearToViewport(stickyRect);
      if (supportsWillChange) {
        styles.willChange = shouldAccelerate ? 'position, top' : null;
      } else {
        styles.transform = shouldAccelerate ? `translateZ(0)` : null;
      }
    }

    return styles;
  }

  recalculateLayoutBeforeUpdate = (): IRect => {
    return this.stickyRef.current.getBoundingClientRect();
  };

  handleViewportUpdate = (
    { scroll }: { scroll: IScroll },
    stickyRect: IRect,
  ) => {
    const nextOffset = Math.max(stickyRect.bottom, 0);
    const nextOffsetHeight = stickyRect.height;
    const offsetDidChange = this.state.stickyOffset !== nextOffset;
    const offsetHeightDidChange =
      this.state.stickyOffsetHeight !== nextOffsetHeight;
    if (this.props.updateStickyOffset && offsetDidChange) {
      this.props.updateStickyOffset(nextOffset, nextOffsetHeight);
    }

    const styles = this.getStickyStyles(stickyRect, scroll);
    const stateStyles = this.state.styles;
    const stylesDidChange = !shallowEqual(styles, stateStyles);

    if (!stylesDidChange && !offsetDidChange && !offsetHeightDidChange) {
      return;
    }

    this.setState({
      styles: stylesDidChange ? styles : stateStyles,
      stickyOffset: nextOffset,
      stickyOffsetHeight: nextOffsetHeight,
    });
  };

  renderSticky = ({ isRecalculating }: { isRecalculating: boolean }) => {
    const { disabled, children, stickyProps } = this.props;
    return (
      <StickyElement<TRenderChildren<undefined>>
        forwardRef={this.stickyRef}
        positionStyle={this.state.styles}
        disabled={disabled || isRecalculating}
        children={children}
        {...stickyProps}
      />
    );
  };

  render() {
    const { disabled, disableResizing, style, className } = this.props;
    return (
      <>
        <StickyPlaceholder
          className={className}
          style={style}
          disabled={disabled}
          stickyRef={this.stickyRef}
          disableResizing={disableResizing}
        >
          {this.renderSticky}
        </StickyPlaceholder>
        <ObserveViewport
          disableScrollUpdates={disabled}
          disableDimensionsUpdates
          onUpdate={this.handleViewportUpdate}
          recalculateLayoutBeforeUpdate={this.recalculateLayoutBeforeUpdate}
        />
      </>
    );
  }
}

export default connectStickyProvider()<IOwnProps>(StickyScrollUp);
