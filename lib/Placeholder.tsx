import * as React from 'react';

import { ObserveBoundingClientRect, IRect } from 'react-viewport-utils';

interface IProps {
  style?: React.CSSProperties;
  className?: string;
  forwardRef?: React.RefObject<any>;
  node: React.RefObject<any>;
  disabled: boolean;
  children: (rect: IRect | null) => React.ReactNode;
}

interface IState {
  height?: number | 'auto';
  width?: number | 'auto';
}

export default class Placeholder extends React.PureComponent<IProps, IState> {
  static defaultProps = {
    style: {},
  };

  constructor(props: IProps) {
    super(props);
    this.state = {
      height: 'auto',
      width: 'auto',
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

  render() {
    return (
      <div
        ref={this.props.forwardRef}
        style={!this.props.disabled ? this.getPlaceholderStyles() : null}
        className={this.props.className}
      >
        <ObserveBoundingClientRect
          node={this.props.node}
          setInitials={this.setDimensions}
        >
          {this.props.children}
        </ObserveBoundingClientRect>
      </div>
    );
  }
}
