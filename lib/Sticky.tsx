import * as React from 'react';
import { ObserveViewport, IRect, IDimensions } from 'react-viewport-utils';
import { shallowEqual } from 'recompose';

import {
  connect as connectStickyScrollUpProvider,
  IInjectedProps as IStickyInjectedProps,
} from './StickyScrollUpProvider';
import StickyElement from './StickyElement';
import { TRenderChildren } from './types';

interface IOwnProps {
  container?: React.RefObject<any>;
  defaultOffsetTop?: number;
  disableHardwareAcceleration?: boolean;
  disableResizing?: boolean;
  disabled?: boolean;
  stickyProps?: {};
  style?: React.CSSProperties;
}

interface IProps extends IOwnProps, IStickyInjectedProps {}

interface IState {
  isSticky: boolean;
  isDockedToBottom: boolean;
  isRecalculating: boolean;
  styles: React.CSSProperties;
  stickyHeight: number | null;
  stickyWidth: number | null;
  clientSize: string | null;
}

class Sticky extends React.PureComponent<IProps, IState> {
  private stickyRef: React.RefObject<any> = React.createRef();
  private placeholderRef: React.RefObject<any> = React.createRef();

  static defaultProps = {
    stickyOffset: { top: 0 },
    defaultOffsetTop: 0,
    disableResizing: false,
    disableHardwareAcceleration: false,
    style: {},
  };

  state: IState = {
    isSticky: false,
    isDockedToBottom: false,
    styles: {},
    isRecalculating: false,
    stickyHeight: null,
    stickyWidth: null,
    clientSize: null,
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

  isSticky = (rect: IRect, containerRect: IRect) => {
    if (!this.hasContainer()) {
      return containerRect.top <= this.offsetTop;
    }

    if (containerRect.top > this.offsetTop) {
      return false;
    }

    if (containerRect.bottom - this.offsetTop < rect.height) {
      return false;
    }

    return true;
  };

  isDockedToBottom = (rect: IRect, containerRect: IRect) => {
    if (!rect || !containerRect) {
      return false;
    }

    if (!this.hasContainer()) {
      return false;
    }

    if (containerRect.bottom - this.offsetTop >= rect.height) {
      return false;
    }

    return true;
  };

  calcPositionStyles(rect: IRect, containerRect: IRect): React.CSSProperties {
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
  }

  getStickyStyles(rect: IRect, containerRect: IRect): React.CSSProperties {
    const styles = this.calcPositionStyles(rect, containerRect);
    const isSticky = this.isSticky(rect, containerRect);
    const transform = `translateY(${isSticky ? this.offsetTop : 0}px)`;

    if (this.props.disableHardwareAcceleration) {
      styles.transform = transform;
    } else {
      styles.transform = `${transform} translateZ(0)`;
      styles.willChange = 'position, top, transform';
    }

    return styles;
  }

  handleViewportUpdate = ({ dimensions }: { dimensions: IDimensions }) => {
    const stickyRect = this.stickyRef.current.getBoundingClientRect();
    const containerRect = this.container.current.getBoundingClientRect();

    // in case children is not a function renderArgs will never be used
    const willRenderAsAFunction = typeof this.props.children === 'function';

    const styles = this.getStickyStyles(stickyRect, containerRect);
    const stateStyles = this.state.styles;
    const isSticky = willRenderAsAFunction
      ? this.isSticky(stickyRect, containerRect)
      : false;
    const isDockedToBottom = willRenderAsAFunction
      ? this.isDockedToBottom(stickyRect, containerRect)
      : false;
    const nextClientSize = `${dimensions.width}`;
    const shouldRecalculate =
      !this.props.disableResizing && this.state.clientSize !== nextClientSize;

    this.setState(
      {
        isSticky,
        isDockedToBottom,
        styles: shallowEqual(styles, stateStyles) ? stateStyles : styles,
        stickyHeight: stickyRect.height,
        stickyWidth: stickyRect.width,
        clientSize: nextClientSize,
        isRecalculating: shouldRecalculate,
      },
      () => {
        if (shouldRecalculate) {
          this.handleViewportUpdate({ dimensions });
        }
      },
    );
  };

  render() {
    const { children, disabled, stickyProps, style } = this.props;
    const { styles, isRecalculating, stickyHeight, stickyWidth } = this.state;
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
      <>
        <div ref={this.placeholderRef} style={containerStyle}>
          <StickyElement<
            TRenderChildren<{
              isSticky: boolean;
              isDockedToBottom: boolean;
            }>
          >
            forwardRef={this.stickyRef}
            positionStyle={styles}
            disabled={!isActive}
            children={children}
            renderArgs={{
              isSticky: this.state.isSticky,
              isDockedToBottom: this.state.isDockedToBottom,
            }}
            {...stickyProps}
          />
        </div>
        <ObserveViewport onUpdate={this.handleViewportUpdate} />
      </>
    );
  }
}

export default connectStickyScrollUpProvider()<IOwnProps>(Sticky);
