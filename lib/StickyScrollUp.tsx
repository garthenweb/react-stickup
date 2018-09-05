import * as React from 'react';
import { connectViewportScroll, IScroll, IRect } from 'react-viewport-utils';
import compose from 'recompose/compose';
import mapProps from 'recompose/mapProps';
import shallowEqual from 'recompose/shallowEqual';

import { connect as connectStickyScrollUpProvider } from './StickyScrollUpProvider';
import Placeholder from './Placeholder';
import StickyElement from './StickyElement';

import { IStickyComponentProps, TRenderChildren } from './types';

interface IStickyInjectedProps {
  updateStickyOffset: (offset: number) => void;
}

interface IViewportInjectedProps {
  scroll: IScroll;
}

interface IOwnProps extends IStickyComponentProps<{}> {}

interface IProps
  extends IViewportInjectedProps,
    IStickyInjectedProps,
    IOwnProps {}

interface IState {
  stickyRect: IRect | null;
  isRecalculating: boolean;
}

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
      top: Math.max(Math.floor(scroll.y - offsetTop + rect.top), 0),
    };
  }

  const isTopVisible = rectTop >= 0;
  const isBottomVisible = rectTop + rect.height <= 0;
  if (!isTopVisible && !isBottomVisible) {
    return {
      position: 'absolute',
      top: Math.floor(scroll.y - offsetTop + rect.top),
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

class StickyScrollUp extends React.Component<IProps, IState> {
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
    this.state = {
      stickyRect: null,
      isRecalculating: false,
    };
  }

  shouldComponentUpdate(
    { scroll: nextScroll, ...nextProps }: IProps,
    nextState: IState,
  ) {
    const { scroll, ...props } = this.props;
    const scrollEquals = shallowEqual(nextScroll, scroll);
    if (!scrollEquals) {
      return true;
    }
    return (
      !shallowEqual(nextProps, props) || !shallowEqual(nextState, this.state)
    );
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

  handleUpdate = (stickyRect: IRect | null) => {
    if (this.props.updateStickyOffset) {
      const offset = Math.max(stickyRect.bottom, 0);
      this.props.updateStickyOffset(offset);
    }

    this.setState({
      stickyRect,
    });
  };

  handleRecalculation = (isRecalculating: boolean) => {
    this.setState({
      isRecalculating,
    });
  };

  render() {
    const { stickyProps, children, disabled } = this.props;
    const styles = this.getStickyStyles(this.state.stickyRect);
    return (
      <Placeholder
        node={this.stickyRef}
        style={this.props.style}
        className={this.props.className}
        disabled={this.props.disabled}
        disableResizing={this.props.disableResizing}
        onUpdate={this.handleUpdate}
        onRecalculationChange={this.handleRecalculation}
      >
        <StickyElement<TRenderChildren<undefined>>
          forwardRef={this.stickyRef}
          positionStyle={styles}
          disabled={disabled || this.state.isRecalculating}
          children={children}
          {...stickyProps}
        />
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
