import * as React from 'react';
import { ViewportProvider } from 'react-viewport-utils';

const StickyGroupContext = React.createContext({
  stickyOffset: 0,
  updateStickyOffset: (offset: number) => {},
});

export const connect = () => (WrappedComponent: React.ComponentType<any>) => (props: any) => {
  return (
    <StickyGroupContext.Consumer>
      {context => (
        <WrappedComponent
          {...props}
          stickyOffset={context.stickyOffset}
          updateStickyOffset={context.updateStickyOffset}
        />
      )}
    </StickyGroupContext.Consumer>
  );
};

interface IProps {}

interface IState {
  stickyOffset: number;
}

export default class StickyScrollUpProvider extends React.PureComponent<
  IProps,
  IState
> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      stickyOffset: 0,
    };
  }

  updateStickyOffset = (stickyOffset: number) => {
    this.setState({
      stickyOffset,
    });
  };

  render() {
    return (
      <ViewportProvider>
        <StickyGroupContext.Provider
          value={{
            updateStickyOffset: this.updateStickyOffset,
            stickyOffset: this.state.stickyOffset,
          }}
        >
          {this.props.children}
        </StickyGroupContext.Provider>
      </ViewportProvider>
    );
  }
}
