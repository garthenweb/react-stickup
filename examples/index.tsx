import * as React from 'react';
import { render } from 'react-dom';
import { ObserveViewport } from 'react-viewport-utils';

import { Sticky, StickyScrollUp, StickyProvider } from '../lib/index';

import './styles.css';

const Placeholder = () => <div className="placeholder" />;

class Example extends React.PureComponent<{}, { disableHeader: boolean }> {
  private container1: React.RefObject<any>;
  private container2: React.RefObject<any>;
  private container3: React.RefObject<any>;
  private container4: React.RefObject<any>;

  constructor(props) {
    super(props);
    this.container1 = React.createRef();
    this.container2 = React.createRef();
    this.container3 = React.createRef();
    this.container4 = React.createRef();
    this.state = {
      disableHeader: false,
    };
  }

  toggleHeaderState() {
    this.setState({
      disableHeader: !this.state.disableHeader,
    });
  }

  render() {
    return (
      <>
        <ObserveViewport disableDimensionsUpdates>
          {({ scroll }) => (
            <div className="scrollPosition">
              {scroll.x.toFixed(2)}x{scroll.y.toFixed(2)}
            </div>
          )}
        </ObserveViewport>
        <Placeholder />
        <StickyScrollUp
          className="header-container"
          disabled={this.state.disableHeader}
          defaultOffsetTop={1000}
        >
          <div className="header">Header</div>
        </StickyScrollUp>
        <Placeholder />

        <div ref={this.container1}>
          <Sticky container={this.container1} style={{ marginTop: 100 }}>
            <div className="sticky-inline">style: marginTop: 100</div>
          </Sticky>
          <Placeholder />
        </div>

        <div ref={this.container2}>
          <Sticky
            container={this.container2}
            stickyProps={{ className: 'sticky-placeholder' }}
          >
            {({ isSticky, isDockedToBottom }) => (
              <div className="sticky-inline sticky-inline-odd">
                stickyProps: paddingBottom: 100
                <br />
                isSticky: {isSticky ? 'true' : 'false'}
                <br />
                isDockedToBottom: {isDockedToBottom ? 'true' : 'false'}
                <br />
              </div>
            )}
          </Sticky>
          <Placeholder />
        </div>

        <div className="wrapper" ref={this.container3}>
          <Sticky container={this.container3}>
            <div className="sticky-inline">default props</div>
          </Sticky>
          <Placeholder />
        </div>

        <div ref={this.container4}>
          <Sticky container={this.container4} defaultOffsetTop={100}>
            <div className="sticky-inline sticky-inline-odd">
              defaultOffsetTop: 100
            </div>
          </Sticky>
          <Placeholder />
        </div>

        <Sticky disableHardwareAcceleration>
          <div className="sticky-inline">disableHardwareAcceleration: true</div>
        </Sticky>

        <Placeholder />
        <button onClick={() => this.toggleHeaderState()}>
          Toggle Header Active State
        </button>
        <Placeholder />
        <Placeholder />
      </>
    );
  }
}

render(
  <React.StrictMode>
    <StickyProvider>
      <main role="main">
        <Example />
        <Placeholder />
        <Placeholder />
        <Placeholder />
      </main>
    </StickyProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
