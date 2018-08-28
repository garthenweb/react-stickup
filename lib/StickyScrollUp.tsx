import * as React from 'react';
import {
  ObserveBoundingClientRect,
  connectViewportScroll,
} from 'react-viewport-utils';
import { connect as connectStickyGroup } from './StickyScrollUpProvider';

interface IRect {
  height: number;
  width: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface IRectOptional {
  height?: number;
  width?: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

interface IScroll {
  y: number;
  yTurn: number;
  yDTurn: number;
  isScrollingDown: boolean;
  isScrollingUp: boolean;
}

interface IProps {
  scroll: IScroll;
  style?: React.CSSProperties;
  disabled?: boolean;
  updateStickyOffset?: (offset: number) => void;
}

interface IState {
  initRect: IRectOptional;
}

const calcPositionStyles = (
  rect: IRect,
  scroll: IScroll,
): React.CSSProperties => {
  if (scroll.isScrollingDown) {
    return {
      position: 'absolute',
      top: scroll.y + rect.top,
    };
  }

  const isTopVisible = rect.top >= 0;
  const isBottomVisible = rect.top + rect.height <= 0;
  if (!isTopVisible && !isBottomVisible) {
    return {
      position: 'absolute',
      top: scroll.y + rect.top,
    };
  }

  if (scroll.y === 0) {
    return {
      position: 'absolute',
      top: 0,
    };
  }

  if (scroll.yDTurn === 0) {
    return {
      position: 'absolute',
      top: scroll.yTurn - rect.height,
    };
  }

  return {
    position: 'fixed',
    top: 0,
  };
};

const baseStyles: React.CSSProperties = {
  transform: 'translateZ(0)',
  willChange: 'position, top',
  position: 'static',
  top: 'auto',
  width: '100%',
  zIndex: 1,
};

class StickyScrollUp extends React.PureComponent<IProps, IState> {
  private stickyRef: React.RefObject<any>;
  static defaultProps = {
    disabled: false,
  };

  constructor(props: IProps) {
    super(props);
    this.stickyRef = React.createRef();

    this.state = {
      initRect: {},
    };
  }

  componentDidUpdate() {
    if (this.props.updateStickyOffset) {
      const { bottom } = this.stickyRef.current.getBoundingClientRect();
      const offset = Math.max(bottom, 0);
      this.props.updateStickyOffset(offset);
    }
  }

  getPlaceholderStyles(): React.CSSProperties {
    const { style = {} } = this.props;
    const { height = 'auto', width = 'auto' } = this.state.initRect;
    return {
      position: 'relative',
      height,
      width,
      ...style,
    };
  }

  setInitials = (rect: IRect) => {
    this.setState({
      initRect: rect,
    });
  };

  render() {
    const { scroll, children, disabled } = this.props;
    return (
      <ObserveBoundingClientRect
        node={this.stickyRef}
        setInitials={this.setInitials}
      >
        {rect => {
          const styles =
            !disabled && rect
              ? {
                  ...baseStyles,
                  ...calcPositionStyles(rect, scroll),
                }
              : null;
          return (
            <div style={this.getPlaceholderStyles()}>
              <div ref={this.stickyRef} style={styles}>
                {children}
              </div>
            </div>
          );
        }}
      </ObserveBoundingClientRect>
    );
  }
}

export default connectStickyGroup()(connectViewportScroll()(StickyScrollUp));
