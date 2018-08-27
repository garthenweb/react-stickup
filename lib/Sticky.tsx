import * as React from 'react';
import { ObserveBoundingClientRect } from 'react-viewport-utils';
import { connect as connectStickyGroup } from './StickyScrollUpProvider';

interface IChildrenOptions {
  isSticky: boolean;
  isDockedToBottom: boolean;
}

interface IProps {
  children?: React.ReactNode | ((options: IChildrenOptions) => React.ReactNode);
  container?: React.RefObject<any>;
  stickyOffset: number;
}

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

interface IState {
  initRect: IRectOptional;
}

const baseStyles: React.CSSProperties = {
  willChange: 'position, top',
  position: 'static',
  top: 'auto',
  width: '100%',
};

class Sticky extends React.PureComponent<IProps, IState> {
  private stickyRef: React.RefObject<any>;
  private placeholderRef: React.RefObject<any>;
  static defaultProps = {
    stickyOffset: 0,
  };

  constructor(props: IProps) {
    super(props);

    this.stickyRef = React.createRef();
    this.placeholderRef = React.createRef();

    this.state = {
      initRect: {},
    };
  }

  hasContainer = () => {
    return Boolean(this.props.container);
  };

  isSticky = (rect: IRect | null, containerRect: IRect | null) => {
    if (!rect || !containerRect) {
      return false;
    }

    if (!this.hasContainer()) {
      return containerRect.top <= this.props.stickyOffset;
    }

    if (containerRect.top > this.props.stickyOffset) {
      return false;
    }

    if (containerRect.bottom - this.props.stickyOffset < rect.height) {
      return false;
    }

    return true;
  };

  isDockedToBottom = (rect: IRect | null, containerRect: IRect | null) => {
    if (!rect || !containerRect) {
      return false;
    }

    if (!this.hasContainer()) {
      return false;
    }

    if (containerRect.bottom - this.props.stickyOffset >= rect.height) {
      return false;
    }

    return true;
  };

  calcPositionStyles = (
    rect: IRect,
    containerRect: IRect,
  ): React.CSSProperties => {
    if (this.isSticky(rect, containerRect)) {
      return {
        position: 'fixed',
        top: 0,
      };
    }

    if (this.isDockedToBottom(rect, containerRect)) {
      return {
        position: 'absolute',
        top: containerRect.height - rect.height,
      };
    }

    return {
      position: 'absolute',
      top: 0,
    };
  };

  getStickyStyles(
    rect: IRect | null,
    containerRect: IRect | null,
  ): React.CSSProperties | null {
    if (!rect || !containerRect) {
      return null;
    }

    const offset = this.props.stickyOffset;
    const isSticky = this.isSticky(rect, containerRect);
    const transform = `
      translateZ(0)
      translateY(${isSticky ? offset : 0}px)
    `;
    return {
      transform,
      ...baseStyles,
      ...this.calcPositionStyles(rect, containerRect),
    };
  }

  getPlaceholderStyles(): React.CSSProperties {
    const { height = 'auto', width = 'auto' } = this.state.initRect;
    return {
      position: 'relative',
      height,
      width,
    };
  }

  setInitials = (rect: IRectOptional) => {
    this.setState({
      initRect: rect,
    });
  };

  renderSticky(rect: IRect | null, containerRect: IRect | null) {
    const { children } = this.props;
    return (
      <div
        ref={this.stickyRef}
        style={this.getStickyStyles(rect, containerRect) || {}}
      >
        {typeof children === 'function'
          ? children({
              isSticky: this.isSticky(rect, containerRect),
              isDockedToBottom: this.isDockedToBottom(rect, containerRect),
            })
          : children}
      </div>
    );
  }

  render() {
    const { container } = this.props;
    return (
      <div ref={this.placeholderRef} style={this.getPlaceholderStyles()}>
        <ObserveBoundingClientRect node={container || this.placeholderRef}>
          {containerRect => (
            <ObserveBoundingClientRect
              node={this.stickyRef}
              setInitials={this.setInitials}
            >
              {rect => this.renderSticky(rect, containerRect)}
            </ObserveBoundingClientRect>
          )}
        </ObserveBoundingClientRect>
      </div>
    );
  }
}

export default connectStickyGroup()(Sticky);
