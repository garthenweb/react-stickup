import * as React from 'react';
import { ObserveViewport, IRect } from 'react-viewport-utils';
import { shallowEqual } from 'recompose';

import { connect as connectStickyProvider } from './StickyProvider';
import StickyElement from './StickyElement';
import StickyPlaceholder from './StickyPlaceholder';
import {
  TRenderChildren,
  IStickyComponentProps,
  IStickyInjectedProps,
} from './types';

interface IOwnProps extends IStickyComponentProps {
  container?: React.RefObject<any>;
  children?: TRenderChildren<{
    isSticky: boolean;
    isDockedToBottom: boolean;
  }>;
}

interface IProps extends IOwnProps, IStickyInjectedProps {}

interface IState {
  isSticky: boolean;
  isDockedToBottom: boolean;
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

  recalculateLayoutBeforeUpdate = (): ILayoutSnapshot => {
    const stickyRect = this.stickyRef.current.getBoundingClientRect();
    const containerRect = this.container.current.getBoundingClientRect();
    return {
      stickyRect,
      containerRect,
    };
  };

  handleScrollUpdate = (
    _: any,
    { stickyRect, containerRect }: ILayoutSnapshot,
  ) => {
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

    this.setState({
      isSticky,
      isDockedToBottom,
      styles: shallowEqual(styles, stateStyles) ? stateStyles : styles,
    });
  };

  renderSticky = ({ isRecalculating }) => {
    const { children, disabled, stickyProps } = this.props;
    return (
      <StickyElement<
        TRenderChildren<{
          isSticky: boolean;
          isDockedToBottom: boolean;
        }>
      >
        forwardRef={this.stickyRef}
        positionStyle={this.state.styles}
        disabled={disabled || isRecalculating}
        children={children}
        renderArgs={{
          isSticky: this.state.isSticky,
          isDockedToBottom: this.state.isDockedToBottom,
        }}
        {...stickyProps}
      />
    );
  };

  render() {
    const { disabled, disableResizing, style, className } = this.props;
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
          disableDimensionsUpdates
          onUpdate={this.handleScrollUpdate}
          recalculateLayoutBeforeUpdate={this.recalculateLayoutBeforeUpdate}
        />
      </>
    );
  }
}

export default connectStickyProvider()<IOwnProps>(Sticky);
