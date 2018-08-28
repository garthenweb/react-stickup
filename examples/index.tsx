import * as React from 'react';
import { render } from 'react-dom';

import { Sticky, StickyScrollUp, StickyScrollUpProvider } from '../lib/index';

import './styles.css';

const Placeholder = () => <div className="placeholder" />;

class Example extends React.PureComponent {
  private container1: React.RefObject<any>;
  private container2: React.RefObject<any>;

  constructor(props) {
    super(props);
    this.container1 = React.createRef();
    this.container2 = React.createRef();
  }

  render() {
    return (
      <>
        <StickyScrollUp>
          <div className="header">Header</div>
        </StickyScrollUp>
        <Placeholder />

        <div ref={this.container1}>
          <Sticky container={this.container1} style={{ marginTop: '100px' }}>
            <div className="sticky-inline">Sticky inline1</div>
          </Sticky>
          <Placeholder />
        </div>

        <div ref={this.container2}>
          <Sticky
            container={this.container2}
            stickyProps={{ className: 'sticky-placeholder' }}
          >
            {({ isSticky, isDockedToBottom }) => (
              <div className="sticky-inline">
                Sticky inline2
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

        <Sticky disableHardwareAcceleration>
          <div className="sticky-inline">Sticky inline3</div>
        </Sticky>

        <Placeholder />
        <Placeholder />
        <Placeholder />
      </>
    );
  }
}

render(
  <StickyScrollUpProvider>
    <main role="main">
      <Example />
      <Placeholder />
      <Placeholder />
      <Placeholder />
    </main>
  </StickyScrollUpProvider>,
  document.getElementById('root'),
);
