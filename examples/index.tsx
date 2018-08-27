import * as React from 'react';
import { render } from 'react-dom';

import { ViewportProvider } from 'react-viewport-utils';
import StickyScrollUp from '../lib/StickyScrollUp';
import Sticky from '../lib/Sticky';
import StickyGroupProvider from '../lib/StickyScrollUpProvider';

import './styles.css';

const Placeholder = () => <div className="placeholder" />;

class Example extends React.PureComponent {
  private container1: React.RefObject<any>;

  constructor(props) {
    super(props);
    this.container1 = React.createRef();
  }

  render() {
    return (
      <StickyGroupProvider>
        <StickyScrollUp>
          <div className="header">Header</div>
        </StickyScrollUp>
        <Placeholder />

        <div ref={this.container1}>
          <Sticky container={this.container1}>
            <div className="sticky-inline">Sticky inline1</div>
          </Sticky>
          <Placeholder />
        </div>

        <Sticky>
          <div className="sticky-inline">Sticky inline2</div>
        </Sticky>

        <Placeholder />
        <Placeholder />
        <Placeholder />
      </StickyGroupProvider>
    );
  }
}

render(
  <ViewportProvider>
    <main role="main">
      <Example />
      <Placeholder />
      <Placeholder />
      <Placeholder />
    </main>
  </ViewportProvider>,
  document.getElementById('root'),
);
