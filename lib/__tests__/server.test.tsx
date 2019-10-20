/**
 * @jest-environment node
 */
import * as React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StickyScrollUp, Sticky, StickyProvider } from '../index';

describe('server side rendering', () => {
  const render = () => {
    return ReactDOMServer.renderToString(
      <StickyProvider>
        <StickyScrollUp>
          <div />
        </StickyScrollUp>
        <Sticky>
          <div />
        </Sticky>
      </StickyProvider>,
    );
  };

  it('should not throw', () => {
    expect(render).not.toThrow();
  });

  it('should render components as if they would have been disabled', () => {
    expect(render()).toBe(
      '<div style="position:relative"><div style="width:inherit"><div></div></div></div><div style="position:relative"><div style="width:inherit"><div></div></div></div>',
    );
  });
});
