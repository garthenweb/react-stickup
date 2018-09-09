import * as React from 'react';
import { connectViewport, IDimensions } from 'react-viewport-utils';

interface IOwnProps {
  disableResizing: boolean;
  disabled: boolean;
  style: React.CSSProperties | null;
  stickyRef: React.RefObject<any>;
  children: (props: { isRecalculating: boolean }) => React.ReactNode;
  className?: string;
  forwardRef?: React.RefObject<any>;
}

interface IProps extends IOwnProps {
  dimensions: IDimensions;
  scroll: null;
}

interface IState {
  isRecalculating: boolean;
  stickyHeight: number | null;
  stickyWidth: number | null;
  clientSize: string | null;
}

class StickyPlaceholder extends React.PureComponent<IProps, IState> {
  static defaultProps = {
    stickyOffset: { top: 0 },
    defaultOffsetTop: 0,
    disableResizing: false,
    disableHardwareAcceleration: false,
    style: {},
  };

  state: IState = {
    isRecalculating: false,
    stickyHeight: null,
    stickyWidth: null,
    clientSize: null,
  };

  componentDidUpdate() {
    if (this.state.isRecalculating) {
      this.setState(
        StickyPlaceholder.getDerivedStateFromProps(this.props, this.state),
      );
    }
  }

  static getDerivedStateFromProps(props: IProps, state: IState): IState {
    if (!props.stickyRef.current) {
      return {
        ...state,
        isRecalculating: true,
      };
    }

    const stickyRect = props.stickyRef.current.getBoundingClientRect();
    const nextClientSize = `${props.dimensions.width}`;
    const shouldRecalculate =
      !props.disableResizing && state.clientSize !== nextClientSize;

    return {
      stickyHeight: stickyRect.height,
      stickyWidth: stickyRect.width,
      clientSize: nextClientSize,
      isRecalculating: shouldRecalculate,
    };
  }

  render() {
    const { children, disabled, style, className, forwardRef } = this.props;
    const { isRecalculating, stickyHeight, stickyWidth } = this.state;
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
      <div ref={forwardRef} style={containerStyle} className={className}>
        {children({ isRecalculating })}
      </div>
    );
  }
}

export default connectViewport({ omit: ['scroll'] })<IOwnProps>(
  StickyPlaceholder,
);
