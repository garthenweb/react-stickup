import * as React from 'react';
import { ObserveViewport, IRect, IScroll } from 'react-viewport-utils';

import { connect as connectStickyProvider } from './StickyProvider';
import StickyElement from './StickyElement';
import StickyPlaceholder from './StickyPlaceholder';
import {
  TRenderChildren,
  IStickyComponentProps,
  IStickyInjectedProps,
  IPositionStyles,
} from './types';
import { supportsWillChange, shallowEqualPositionStyles } from './utils';

interface IOwnProps extends IStickyComponentProps {
  /**
   * The child node that is rendered within the sticky container. When rendered as a function it will add further information the the function which can be used e.g. to update stylings.
   */
  children?: TRenderChildren<{
    isNearToViewport: boolean;
    isSticky: boolean;
  }>;
  /**
   * When not initialized as the first element within the page (directly at the top) this allows to set an offset by hand from where the component will be sticky.
   * @deprecated If not set, the start position is now calculated by default as it was already the case for the `Sticky` component. As there is no use case for this property anymore it will be removed in the future.
   */
  defaultOffsetTop?: number;
}

interface IProps extends IOwnProps, IStickyInjectedProps {}

interface IState {
  styles: IPositionStyles;
  isNearToViewport: boolean;
  isSticky: boolean;
}

const calcPositionStyles = (
  rect: IRect,
  scroll: IScroll,
  { offsetTop = 0 },
): IPositionStyles => {
  const rectTop = Math.round(rect.top);
  const scrollY = Math.round(scroll.y);
  if (scroll.isScrollingDown) {
    // disable sticky mode above the top offset while scrolling down
    if (rectTop > 0 && scrollY < offsetTop) {
      return {
        position: 'absolute',
        top: 0,
      };
    }

    // element is visible and scrolls down
    return {
      position: 'absolute',
      top: Math.max(scrollY - offsetTop + rectTop, 0),
    };
  }

  const isTopVisible = rectTop >= 0;
  const isBottomVisible = rectTop + rect.height <= 0;
  // element is visible and scrolls up
  if (!isTopVisible && !isBottomVisible) {
    return {
      position: 'absolute',
      top: scrollY - offsetTop + rectTop,
    };
  }

  // disable sticky mode above the top offset while scrolling up
  if (scrollY <= offsetTop) {
    return {
      position: 'absolute',
      top: 0,
    };
  }

  if (Math.round(scroll.yDTurn) === 0) {
    // scroll direction changed from down to up and the element was not visible
    if (isBottomVisible) {
      return {
        position: 'absolute',
        top: Math.round(scroll.yTurn) - offsetTop - rect.height,
      };
    }
    // scroll direction changed from down to up and the element was fully visible
    return {
      position: 'absolute',
      top: Math.max(scrollY - offsetTop, 0),
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
  private placeholderRef: React.RefObject<any> = React.createRef();
  private stickyOffset: number | null = null;
  private stickyOffsetHeight: number = 0;

  static defaultProps = {
    disableHardwareAcceleration: false,
    disableResizing: false,
    style: {},
  };

  state: IState = {
    styles: {},
    isNearToViewport: false,
    isSticky: false,
  };

  componentDidUpdate(prevProps: IProps, prevState: IState) {
    if (
      this.props.updateStickyOffset &&
      prevProps.disabled !== this.props.disabled
    ) {
      this.props.updateStickyOffset(
        this.props.disabled ? 0 : this.stickyOffset,
        this.stickyOffsetHeight,
      );
    }
  }

  isNearToViewport = (rect: IRect): boolean => {
    const padding = 700;
    return rect.top - padding < 0;
  };

  getStickyStyles(stickyRect: IRect, placeholderRect: IRect, scroll: IScroll) {
    const offsetTop = isNaN(this.props.defaultOffsetTop)
      ? Math.round(placeholderRect.top) + Math.round(scroll.y)
      : this.props.defaultOffsetTop;
    const styles = calcPositionStyles(stickyRect, scroll, {
      offsetTop,
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

  recalculateLayoutBeforeUpdate = (): {
    stickyRect: IRect;
    placeholderRect: IRect;
  } => {
    return {
      placeholderRect: this.placeholderRef.current.getBoundingClientRect(),
      stickyRect: this.stickyRef.current.getBoundingClientRect(),
    };
  };

  handleViewportUpdate = (
    { scroll }: { scroll: IScroll },
    {
      stickyRect,
      placeholderRect,
    }: { stickyRect: IRect; placeholderRect: IRect },
  ) => {
    if (this.props.disabled) {
      return;
    }
    // in case children is not a function renderArgs will never be used
    const willRenderAsAFunction = typeof this.props.children === 'function';

    const nextOffset = Math.max(Math.round(stickyRect.bottom), 0);
    const nextOffsetHeight = stickyRect.height;
    const offsetDidChange = this.stickyOffset !== nextOffset;
    const offsetHeightDidChange = this.stickyOffsetHeight !== nextOffsetHeight;

    const styles = this.getStickyStyles(stickyRect, placeholderRect, scroll);
    const stateStyles = this.state.styles;
    const stylesDidChange = !shallowEqualPositionStyles(styles, stateStyles);
    const isNearToViewport = this.isNearToViewport(stickyRect);
    const isSticky = willRenderAsAFunction
      ? styles.top === 0 && styles.position === 'fixed'
      : false;
    const isNearToViewportDidChange =
      this.state.isNearToViewport !== isNearToViewport;
    const isStickyDidChange = this.state.isSticky !== isSticky;

    if (
      this.props.updateStickyOffset &&
      (offsetDidChange || offsetHeightDidChange)
    ) {
      this.props.updateStickyOffset(nextOffset, nextOffsetHeight);
    }

    if (!stylesDidChange && !isNearToViewportDidChange && !isStickyDidChange) {
      return;
    }

    this.setState({
      styles: stylesDidChange ? styles : stateStyles,
      isNearToViewport,
      isSticky,
    });
  };

  renderSticky = ({ isRecalculating }: { isRecalculating: boolean }) => {
    const { disabled, children, stickyProps } = this.props;
    return (
      <StickyElement<
        TRenderChildren<{
          isNearToViewport: boolean;
          isSticky: boolean;
        }>
      >
        forwardRef={this.stickyRef}
        positionStyle={this.state.styles}
        disabled={disabled || isRecalculating}
        children={children}
        renderArgs={{
          isNearToViewport: this.state.isNearToViewport,
          isSticky: this.state.isSticky,
        }}
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
          forwardRef={this.placeholderRef}
        >
          {this.renderSticky}
        </StickyPlaceholder>
        <ObserveViewport
          disableScrollUpdates={disabled}
          disableDimensionsUpdates
          onUpdate={this.handleViewportUpdate}
          recalculateLayoutBeforeUpdate={this.recalculateLayoutBeforeUpdate}
          priority={this.state.isNearToViewport ? 'highest' : 'low'}
        />
      </>
    );
  }
}

export default connectStickyProvider()<IOwnProps>(StickyScrollUp);
