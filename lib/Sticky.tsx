import * as React from 'react';
import {
  ObserveViewport,
  IRect,
  IScroll,
  IDimensions,
} from 'react-viewport-utils';
import shallowEqual from 'shallowequal';

import { connect as connectStickyProvider } from './StickyProvider';
import StickyElement from './StickyElement';
import StickyPlaceholder from './StickyPlaceholder';
import {
  TRenderChildren,
  IStickyComponentProps,
  IStickyInjectedProps,
} from './types';
import { supportsWillChange } from './utils';

type OverflowScrollType = 'flow' | 'end';

interface IOwnProps extends IStickyComponentProps {
  /**
   * The reference to the container to stick into. If this is not set, the component will be sticky regardless how far the user scrolls down.
   */
  container?: React.RefObject<any>;
  /**
   * The child node that is rendered within the sticky container. When rendered as a function it will add further information the the function which can be used e.g. to update stylings.
   */
  children?: TRenderChildren<{
    isSticky: boolean;
    isDockedToBottom: boolean;
    isNearToViewport: boolean;
  }>;
  /**
   * Defines how the sticky element should react in case its bigger than the viewport.
   * Different options are available:
   * * end: The default value will keep the component sticky as long as it reaches the bottom of its container and only then will scroll down.
   * * flow: The element scrolls with the flow of the scroll direction, therefore the content is easier to access.
   */
  overflowScroll?: OverflowScrollType;
}

interface IProps extends IOwnProps, IStickyInjectedProps {}

interface IState {
  isSticky: boolean;
  isDockedToBottom: boolean;
  isNearToViewport: boolean;
  styles: React.CSSProperties;
}

interface ILayoutSnapshot {
  stickyRect: IRect;
  containerRect: IRect;
}

class Sticky extends React.PureComponent<IProps, IState> {
  private stickyRef: React.RefObject<any> = React.createRef();
  private placeholderRef: React.RefObject<any> = React.createRef();

  static defaultProps = {
    stickyOffset: { top: 0, height: 0 },
    defaultOffsetTop: 0,
    disableResizing: false,
    disableHardwareAcceleration: false,
    overflowScroll: 'end' as OverflowScrollType,
    style: {},
  };

  state: IState = {
    isSticky: false,
    isDockedToBottom: false,
    isNearToViewport: false,
    styles: {},
  };

  get container() {
    return this.props.container || this.placeholderRef;
  }

  get offsetTop() {
    return this.props.stickyOffset.top + this.props.defaultOffsetTop;
  }

  hasContainer = () => {
    return Boolean(this.props.container);
  };

  isNearToViewport = (rect: IRect): boolean => {
    const padding = 300;
    return rect.top - padding < 0 && rect.bottom + padding > 0;
  };

  isSticky = (rect: IRect, containerRect: IRect, dimensions: IDimensions) => {
    if (!this.hasContainer()) {
      return containerRect.top <= this.offsetTop;
    }

    if (containerRect.top > this.offsetTop) {
      return false;
    }

    const height =
      this.props.overflowScroll === 'flow'
        ? Math.min(rect.height, dimensions.clientHeight)
        : rect.height;
    if (containerRect.bottom - this.offsetTop < height) {
      return false;
    }

    return true;
  };

  isDockedToBottom = (
    rect: IRect,
    containerRect: IRect,
    dimensions: IDimensions,
  ) => {
    if (!rect || !containerRect) {
      return false;
    }

    if (!this.hasContainer()) {
      return false;
    }

    const height =
      this.props.overflowScroll === 'flow'
        ? Math.min(rect.height, dimensions.clientHeight)
        : rect.height;
    if (containerRect.bottom - this.offsetTop >= height) {
      return false;
    }

    return true;
  };

  calcHeightDifference(rectSticky: IRect, dimensions: IDimensions) {
    if (!dimensions) {
      return 0;
    }
    return Math.max(0, rectSticky.height - dimensions.clientHeight);
  }

  calcOverflowScrollFlowStickyStyles(
    rectSticky: IRect,
    containerRect: IRect,
    scroll: IScroll,
    dimensions: IDimensions,
  ): React.CSSProperties {
    const heightDiff = this.calcHeightDifference(rectSticky, dimensions);
    const containerTopOffset = containerRect.top + scroll.y;
    const isStickyBottomReached = rectSticky.bottom <= dimensions.clientHeight;
    const isContainerTopReached = containerRect.top < this.offsetTop;
    const isTurnWithinHeightOffset =
      scroll.yTurn - heightDiff <= containerTopOffset;
    const isTurnPointBeforeContainer = scroll.yTurn < containerTopOffset;
    const isTurnPointAfterContainer =
      scroll.yTurn > containerTopOffset + containerRect.height;
    const isTurnPointWithinContainer =
      !isTurnPointBeforeContainer && !isTurnPointAfterContainer;
    // scroll down AND sticky rect bottom not reached AND turn point not within the container OR
    // scroll up AND container top not reached OR
    //scroll up AND turns within the height diff
    if (
      (scroll.isScrollingDown &&
        !isStickyBottomReached &&
        !isTurnPointWithinContainer) ||
      (scroll.isScrollingUp && !isContainerTopReached) ||
      (scroll.isScrollingUp && isTurnWithinHeightOffset)
    ) {
      return {
        position: 'absolute',
        top: 0,
      };
    }

    // scroll down AND sticky bottom reached
    if (scroll.isScrollingDown && isStickyBottomReached) {
      return {
        position: 'fixed',
        top: -heightDiff,
      };
    }

    const isStickyTopReached = rectSticky.top >= this.offsetTop;
    // scroll down AND turn point within container OR
    // scroll up AND turn point not before container AND not sticky top reached
    if (
      (scroll.isScrollingDown && isTurnPointWithinContainer) ||
      (scroll.isScrollingUp &&
        !isTurnPointBeforeContainer &&
        !isStickyTopReached)
    ) {
      return {
        position: 'absolute',
        top: Math.abs(
          scroll.y - rectSticky.top + (containerRect.top - scroll.y),
        ),
      };
    }

    return {
      position: 'fixed',
      top: this.offsetTop,
    };
  }

  calcPositionStyles(
    rectSticky: IRect,
    containerRect: IRect,
    scroll: IScroll,
    dimensions: IDimensions,
  ): React.CSSProperties {
    if (this.isSticky(rectSticky, containerRect, dimensions)) {
      if (
        this.props.overflowScroll === 'flow' &&
        this.calcHeightDifference(rectSticky, dimensions) > 0
      ) {
        return this.calcOverflowScrollFlowStickyStyles(
          rectSticky,
          containerRect,
          scroll,
          dimensions,
        );
      }

      const stickyOffset = Math.round(this.props.stickyOffset.top);
      const stickyHeight = this.props.stickyOffset.height;
      const headIsFlexible = stickyOffset > 0 && stickyOffset < stickyHeight;
      if (headIsFlexible) {
        const relYTurn = scroll.yTurn - scroll.y - containerRect.top;
        return {
          position: 'absolute',
          top: relYTurn + this.offsetTop + scroll.yDTurn,
        };
      }

      return {
        position: 'fixed',
        top: this.offsetTop,
      };
    }

    if (this.isDockedToBottom(rectSticky, containerRect, dimensions)) {
      return {
        position: 'absolute',
        top: containerRect.height - rectSticky.height,
      };
    }

    return {
      position: 'absolute',
      top: 0,
    };
  }

  getStickyStyles(
    rect: IRect,
    containerRect: IRect,
    scroll: IScroll,
    dimensions: IDimensions,
  ): React.CSSProperties {
    const styles = this.calcPositionStyles(
      rect,
      containerRect,
      scroll,
      dimensions,
    );

    if (!this.props.disableHardwareAcceleration) {
      const shouldAccelerate = this.isNearToViewport(rect);
      if (supportsWillChange) {
        styles.willChange = shouldAccelerate ? 'position, top' : null;
      } else {
        styles.transform = shouldAccelerate ? `translateZ(0)` : null;
      }
    }

    return styles;
  }

  recalculateLayoutBeforeUpdate = (): ILayoutSnapshot => {
    const stickyRect = this.stickyRef.current.getBoundingClientRect();
    const containerRect = this.container.current.getBoundingClientRect();
    return {
      stickyRect,
      containerRect,
    };
  };

  handleScrollUpdate = (
    { scroll, dimensions }: { scroll: IScroll; dimensions: IDimensions },
    { stickyRect, containerRect }: ILayoutSnapshot,
  ) => {
    // in case children is not a function renderArgs will never be used
    const willRenderAsAFunction = typeof this.props.children === 'function';

    const styles = this.getStickyStyles(
      stickyRect,
      containerRect,
      scroll,
      dimensions,
    );
    const stateStyles = this.state.styles;
    const stylesDidChange = !shallowEqual(styles, stateStyles);
    const isSticky = willRenderAsAFunction
      ? this.isSticky(stickyRect, containerRect, dimensions)
      : false;
    const isDockedToBottom = willRenderAsAFunction
      ? this.isDockedToBottom(stickyRect, containerRect, dimensions)
      : false;
    const isNearToViewport = this.isNearToViewport(stickyRect);
    const isStickyDidChange = this.state.isSticky !== isSticky;
    const isDockedToBottomDidChange =
      this.state.isDockedToBottom !== isDockedToBottom;
    const isNearToViewportDidChange =
      this.state.isNearToViewport !== isNearToViewport;

    if (
      !stylesDidChange &&
      !isStickyDidChange &&
      !isDockedToBottomDidChange &&
      !isNearToViewportDidChange
    ) {
      return;
    }

    this.setState({
      isSticky,
      isDockedToBottom,
      isNearToViewport,
      styles: stylesDidChange ? styles : stateStyles,
    });
  };

  renderSticky = ({ isRecalculating }: { isRecalculating: boolean }) => {
    const { children, disabled, stickyProps } = this.props;
    return (
      <StickyElement<
        TRenderChildren<{
          isSticky: boolean;
          isDockedToBottom: boolean;
          isNearToViewport: boolean;
        }>
      >
        forwardRef={this.stickyRef}
        positionStyle={this.state.styles}
        disabled={disabled || isRecalculating}
        children={children}
        renderArgs={{
          isSticky: this.state.isSticky,
          isDockedToBottom: this.state.isDockedToBottom,
          isNearToViewport: this.state.isNearToViewport,
        }}
        {...stickyProps}
      />
    );
  };

  render() {
    const {
      disabled,
      disableResizing,
      style,
      className,
      overflowScroll,
    } = this.props;
    return (
      <>
        <StickyPlaceholder
          className={className}
          style={style}
          disabled={disabled}
          forwardRef={this.placeholderRef}
          stickyRef={this.stickyRef}
          disableResizing={disableResizing}
        >
          {this.renderSticky}
        </StickyPlaceholder>
        <ObserveViewport
          disableScrollUpdates={disabled}
          disableDimensionsUpdates={disabled || overflowScroll !== 'flow'}
          onUpdate={this.handleScrollUpdate}
          recalculateLayoutBeforeUpdate={this.recalculateLayoutBeforeUpdate}
          priority={this.state.isNearToViewport ? 'highest' : 'low'}
        />
      </>
    );
  }
}

export default connectStickyProvider()<IOwnProps>(Sticky);
