import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { StickyScrollUp, Sticky, StickyProvider } from '../index';

describe('browser rendering', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <StickyProvider>
        <StickyScrollUp>
          <div />
        </StickyScrollUp>
        <Sticky>
          <div />
        </Sticky>
      </StickyProvider>,
      div,
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
