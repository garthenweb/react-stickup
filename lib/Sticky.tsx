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
    appliedOverflowScroll: OverflowScrollType;
  }>;
  /**
   * Defines how the sticky element should react in case its bigger than the viewport.
   * Different options are available:
   * * end: The default value will keep the component sticky as long as it reaches the bottom of its container and only then will scroll down.
   * * flow: The element scrolls with the flow of the scroll direction, therefore the content is easier to access.
   */
  overflowScroll?: OverflowScrollType;
  /**
   * A top offset to create a padding between the browser window and the sticky component when sticky.
   */
  defaultOffsetTop?: number;
}

interface IProps extends IOwnProps, IStickyInjectedProps {}

interface IState {
  isSticky: boolean;
  isDockedToBottom: boolean;
  isNearToViewport: boolean;
  appliedOverflowScroll: OverflowScrollType;
  styles: React.CSSProperties;
}

interface ILayoutSnapshot {
  stickyRect: IRect;
  containerRect: IRect;
}

class Sticky extends React.PureComponent<IProps, IState> {
  private stickyRef: React.RefObject<HTMLElement> = React.createRef();
  private placeholderRef: React.RefObject<HTMLElement> = React.createRef();

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
    appliedOverflowScroll: 'end',
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

  getOverflowScrollType = (
    rectSticky: IRect,
    dimensions: IDimensions,
  ): OverflowScrollType => {
    return this.props.overflowScroll === 'flow' &&
      this.calcHeightDifference(rectSticky, dimensions) > 0
      ? 'flow'
      : 'end';
  };

  isSticky = (rect: IRect, containerRect: IRect, dimensions: IDimensions) => {
    if (!this.hasContainer()) {
      return Math.round(containerRect.top) <= this.offsetTop;
    }

    if (Math.round(containerRect.top) > this.offsetTop) {
      return false;
    }

    const height =
      this.props.overflowScroll === 'flow'
        ? Math.min(rect.height, dimensions.height)
        : rect.height;
    if (Math.round(containerRect.bottom) - this.offsetTop < height) {
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
        ? Math.min(rect.height, dimensions.height)
        : rect.height;
    if (Math.round(containerRect.bottom) - this.offsetTop >= height) {
      return false;
    }

    return true;
  };

  calcHeightDifference(rectSticky: IRect, dimensions: IDimensions) {
    if (!dimensions) {
      return 0;
    }
    return Math.max(0, Math.round(rectSticky.height) - dimensions.height);
  }

  calcOverflowScrollFlowStickyStyles(
    rectSticky: IRect,
    containerRect: IRect,
    scroll: IScroll,
    dimensions: IDimensions,
  ): React.CSSProperties {
    const containerTop = Math.round(containerRect.top);
    const stickyTop = Math.round(rectSticky.top);
    const scrollY = Math.round(scroll.y);
    const scrollYTurn = Math.round(scroll.yTurn);
    const heightDiff = this.calcHeightDifference(rectSticky, dimensions);
    const containerTopOffset = containerTop + scrollY;
    const isStickyBottomReached =
      Math.round(rectSticky.bottom) <= dimensions.height;
    const isContainerTopReached = containerTop < this.offsetTop;
    const isTurnWithinHeightOffset =
      scrollYTurn - heightDiff <= containerTopOffset;
    const isTurnPointBeforeContainer = scrollYTurn < containerTopOffset;
    const isTurnPointAfterContainer =
      scrollYTurn > containerTopOffset + containerRect.height;
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

    const isStickyTopReached = stickyTop >= this.offsetTop;
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
        top: Math.abs(scrollY - stickyTop + (containerTop - scrollY)),
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
      if (this.getOverflowScrollType(rectSticky, dimensions) === 'flow') {
        return this.calcOverflowScrollFlowStickyStyles(
          rectSticky,
          containerRect,
          scroll,
          dimensions,
        );
      }
      const stickyOffset = this.props.stickyOffset.top;
      const stickyHeight = this.props.stickyOffset.height;
      const headIsFlexible = stickyOffset > 0 && stickyOffset < stickyHeight;
      if (headIsFlexible) {
        const relYTurn =
          Math.round(scroll.yTurn - scroll.y + scroll.yDTurn) -
          Math.round(containerRect.top);
        return {
          position: 'absolute',
          top: relYTurn + this.offsetTop,
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
    const appliedOverflowScroll = this.getOverflowScrollType(
      stickyRect,
      dimensions,
    );
    const isStickyDidChange = this.state.isSticky !== isSticky;
    const isDockedToBottomDidChange =
      this.state.isDockedToBottom !== isDockedToBottom;
    const isNearToViewportDidChange =
      this.state.isNearToViewport !== isNearToViewport;
    const appliedOverflowScrollDidChange =
      appliedOverflowScroll !== this.state.appliedOverflowScroll;

    if (
      !stylesDidChange &&
      !isStickyDidChange &&
      !isDockedToBottomDidChange &&
      !isNearToViewportDidChange &&
      !appliedOverflowScrollDidChange
    ) {
      return;
    }

    this.setState({
      isSticky,
      isDockedToBottom,
      isNearToViewport,
      appliedOverflowScroll,
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
          appliedOverflowScroll: OverflowScrollType;
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
          appliedOverflowScroll: this.state.appliedOverflowScroll,
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
