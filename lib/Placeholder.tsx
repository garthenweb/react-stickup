import * as React from 'react';

import {
  ObserveBoundingClientRect,
  connectViewport,
  IRect,
} from 'react-viewport-utils';
import compose from 'recompose/compose';
import mapProps from 'recompose/mapProps';

export interface IUpdateOptions {
  isRecalculating: boolean;
}

interface IOwnProps {
  style?: React.CSSProperties;
  className?: string;
  forwardRef?: React.RefObject<any>;
  node: React.RefObject<any>;
  disabled: boolean;
  disableResizing?: boolean;
  children: (rect: IRect | null, options: IUpdateOptions) => React.ReactNode;
}

interface IProps extends IOwnProps {
  size: string;
}

interface IState {
  height?: number | 'auto';
  width?: number | 'auto';
  isRecalculating: boolean;
}

class Placeholder extends React.PureComponent<IProps, IState> {
  static defaultProps = {
    style: {},
    disableResizing: false,
  };

  constructor(props: IProps) {
    super(props);
    this.state = {
      height: 'auto',
      width: 'auto',
      isRecalculating: false,
    };
  }

  setDimensions = ({ height, width }: IRect) => {
    this.setState({
      height,
      width,
    });
  };

  getPlaceholderStyles(): React.CSSProperties {
    const { style } = this.props;
    const { height, width } = this.state;
    return {
      position: 'relative',
      height,
      width,
      ...style,
    };
  }

  componentDidUpdate(prevProps: IProps) {
    if (!this.props.disableResizing) {
      if (prevProps.size !== this.props.size) {
        this.setState({
          isRecalculating: true,
        });
      }
    }
  }

  handleUpdate = (rect: IRect) => {
    if (!this.state.isRecalculating) {
      return;
    }
    this.setState({
      isRecalculating: false,
      height: rect.height,
      width: rect.width,
    });
  };

  render() {
    const isActive = !this.state.isRecalculating && !this.props.disabled;
    return (
      <div
        ref={this.props.forwardRef}
        style={isActive ? this.getPlaceholderStyles() : null}
        className={this.props.className}
      >
        <ObserveBoundingClientRect
          node={this.props.node}
          onInit={this.setDimensions}
          onUpdate={this.handleUpdate}
        >
          {rect =>
            this.props.children(rect, {
              isRecalculating: this.state.isRecalculating,
            })
          }
        </ObserveBoundingClientRect>
      </div>
    );
  }
}

export default compose<IOwnProps, IOwnProps>(
  connectViewport(),
  mapProps(({ dimensions, scroll, ...props }) => ({
    size: `${dimensions.width}`,
    ...props,
  })),
)(Placeholder);
