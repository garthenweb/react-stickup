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
  onRecalculationChange: (isRecalculating: boolean) => void;
  onUpdate: (rect: IRect | null) => void;
  children: React.ReactElement<any>;
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
        this.props.onRecalculationChange(true);
      }
    }
  }

  handleUpdate = (rect: IRect) => {
    if (this.props.onUpdate) {
      this.props.onUpdate(rect);
    }

    if (!this.state.isRecalculating) {
      return;
    }

    this.setState({
      isRecalculating: false,
      height: rect.height,
      width: rect.width,
    });
    this.props.onRecalculationChange(false);
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
        />
        {this.props.children}
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
