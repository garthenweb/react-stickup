import * as React from 'react';
import {
  ObserveViewport,
  IDimensions,
  IRect,
  requestAnimationFrame,
  cancelAnimationFrame,
} from 'react-viewport-utils';

interface IProps {
  disableResizing: boolean;
  disabled: boolean;
  style: React.CSSProperties | null;
  stickyRef: React.RefObject<any>;
  children: (props: { isRecalculating: boolean }) => React.ReactNode;
  className?: string;
  forwardRef?: React.RefObject<any>;
}

interface IState {
  isRecalculating: boolean;
  isWaitingForRecalculation: boolean;
  stickyHeight: number | null;
  stickyWidth: number | null;
  clientSize: string | null;
}

class StickyPlaceholder extends React.Component<IProps, IState> {
  private recalculationTick?: number;
  static defaultProps = {
    style: {},
  };

  state: IState = {
    isRecalculating: false,
    isWaitingForRecalculation: false,
    stickyHeight: null,
    stickyWidth: null,
    clientSize: null,
  };

  componentWillUnmount() {
    cancelAnimationFrame(this.recalculationTick);
  }

  calculateSize = () => {
    if (
      this.props.stickyRef.current &&
      !this.state.isRecalculating &&
      this.state.isWaitingForRecalculation
    ) {
      return this.props.stickyRef.current.getBoundingClientRect();
    }
    return null;
  };

  handleDimensionsUpdate = (
    { dimensions }: { dimensions: IDimensions },
    stickyRect: IRect | null,
  ) => {
    const { width, clientWidth } = dimensions;
    const nextClientSize = [width, clientWidth].join(',');

    if (
      !this.state.isWaitingForRecalculation &&
      this.state.clientSize !== nextClientSize
    ) {
      this.setState(
        {
          clientSize: nextClientSize,
          isRecalculating: true,
          isWaitingForRecalculation: true,
        },
        () => {
          this.recalculationTick = requestAnimationFrame(() => {
            this.setState({
              isRecalculating: false,
            });
            this.recalculationTick = undefined;
          });
        },
      );
      return;
    }

    if (stickyRect && this.state.isWaitingForRecalculation) {
      this.setState({
        clientSize: nextClientSize,
        stickyHeight: stickyRect.height,
        stickyWidth: stickyRect.width,
        isWaitingForRecalculation: false,
      });
      return;
    }
  };

  render() {
    const { children, disabled, style, className, forwardRef } = this.props;
    const {
      isRecalculating,
      isWaitingForRecalculation,
      stickyHeight,
      stickyWidth,
    } = this.state;
    const isActive = !disabled && !isWaitingForRecalculation;
    const baseStyle = { position: 'relative', ...style } as const;
    const containerStyle: React.CSSProperties = isActive
      ? ({
          height: stickyHeight,
          width: stickyWidth,
          ...baseStyle,
        } as const)
      : baseStyle;
    return (
      <>
        <div ref={forwardRef} style={containerStyle} className={className}>
          {children({
            isRecalculating: isWaitingForRecalculation,
          })}
        </div>
        {!this.props.disableResizing && (
          <ObserveViewport
            disableScrollUpdates
            disableDimensionsUpdates={isRecalculating}
            onUpdate={this.handleDimensionsUpdate}
            recalculateLayoutBeforeUpdate={this.calculateSize}
            priority="highest"
          />
        )}
      </>
    );
  }
}

export default StickyPlaceholder;
