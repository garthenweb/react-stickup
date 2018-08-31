import * as React from 'react';
import { ObserveBoundingClientRect } from 'react-viewport-utils';

import { connect as connectStickyOffset } from './StickyScrollUpProvider';
import Placeholder from './Placeholder';
import StickyElement from './StickyElement';

import { IRect, TRenderChildren, IStickyComponentProps } from './types';

interface IChildrenOptions {
  isSticky: boolean;
  isDockedToBottom: boolean;
}

interface IProps extends IStickyComponentProps<IChildrenOptions> {
  container?: React.RefObject<any>;
}

class Sticky extends React.PureComponent<IProps> {
  private stickyRef: React.RefObject<any>;
  private placeholderRef: React.RefObject<any>;
  static defaultProps = {
    disabled: false,
    stickyOffset: 0,
    stickyProps: {
      styles: {},
    },
    disableHardwareAcceleration: false,
  };

  constructor(props: IProps) {
    super(props);

    this.stickyRef = React.createRef();
    this.placeholderRef = React.createRef();
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
  ): React.CSSProperties {
    if (!rect || !containerRect) {
      return {};
    }

    const styles = this.calcPositionStyles(rect, containerRect);
    const isSticky = this.isSticky(rect, containerRect);
    const transform = `translateY(${isSticky ? this.props.stickyOffset : 0}px)`;

    if (this.props.disableHardwareAcceleration) {
      styles.transform = transform;
    } else {
      Object.assign(styles, {
        transform: `${transform} translateZ(0)`,
        willChange: 'position, top, transform',
      });
    }

    return styles;
  }

  renderSticky(stickyRect: IRect | null, containerRect: IRect | null) {
    const { children, disabled, stickyProps } = this.props;
    const styles = this.getStickyStyles(stickyRect, containerRect);

    return (
      <StickyElement<
        TRenderChildren<{
          isSticky: boolean;
          isDockedToBottom: boolean;
        }>
      >
        forwardRef={this.stickyRef}
        positionStyle={styles}
        disabled={disabled}
        children={children}
        renderArgs={() => ({
          isSticky: this.isSticky(stickyRect, containerRect),
          isDockedToBottom: this.isDockedToBottom(stickyRect, containerRect),
        })}
        {...stickyProps}
      />
    );
  }

  renderContainerObserver = (stickyRect: IRect | null) => {
    const node = this.props.container || this.placeholderRef;
    return (
      <ObserveBoundingClientRect node={node}>
        {containerRect => this.renderSticky(stickyRect, containerRect)}
      </ObserveBoundingClientRect>
    );
  };

  render() {
    return (
      <Placeholder
        forwardRef={this.placeholderRef}
        node={this.stickyRef}
        style={this.props.style}
        className={this.props.className}
      >
        {this.renderContainerObserver}
      </Placeholder>
    );
  }
}

export default connectStickyOffset()(Sticky);
