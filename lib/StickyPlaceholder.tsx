import * as React from 'react';
import {
  ObserveViewport,
  IDimensions,
  IRect,
  requestAnimationFrame,
  cancelAnimationFrame,
} from 'react-viewport-utils';
import ElementResizeObserver from './ElementResizeObserver';

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
  clientHash: string | null;
}

class StickyPlaceholder extends React.Component<IProps, IState> {
  private recalculationTick?: number;
  private lastDimensions?: IDimensions;
  static defaultProps = {
    style: {},
  };

  state: IState = {
    isRecalculating: false,
    isWaitingForRecalculation: false,
    stickyHeight: null,
    stickyWidth: null,
    clientHash: null,
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
    this.lastDimensions = dimensions;
    const { width, clientWidth } = dimensions;
    const nextClientHash = [width, clientWidth].join(',');

    if (
      !this.state.isWaitingForRecalculation &&
      this.state.clientHash !== nextClientHash
    ) {
      this.setState(
        {
          clientHash: nextClientHash,
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

    if (stickyRect) {
      if (
        this.state.isWaitingForRecalculation ||
        stickyRect.height !== this.state.stickyHeight ||
        stickyRect.width !== this.state.stickyWidth
      ) {
        this.setState({
          clientHash: nextClientHash,
          stickyHeight: stickyRect.height,
          stickyWidth: stickyRect.width,
          isWaitingForRecalculation: false,
        });
        return;
      }
    }
  };

  handleElementResize = (stickyRect: IRect) => {
    if (this.lastDimensions) {
      this.handleDimensionsUpdate(
        { dimensions: this.lastDimensions },
        stickyRect,
      );
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
          <>
            <ObserveViewport
              disableScrollUpdates
              disableDimensionsUpdates={isRecalculating}
              onUpdate={this.handleDimensionsUpdate}
              recalculateLayoutBeforeUpdate={this.calculateSize}
              priority="highest"
            />
            <ElementResizeObserver
              stickyRef={this.props.stickyRef}
              onUpdate={this.handleElementResize}
            />
          </>
        )}
      </>
    );
  }
}

export default StickyPlaceholder;
