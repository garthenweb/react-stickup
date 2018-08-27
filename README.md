# React Stickup

The goal of this project is to create a set of components that create a sticky behavior and are able to interact with each other.

## Caution

This library is in early stages and may contain bugs. Please fill them in the [issues section](https://github.com/garthenweb/react-stickup/issues).

## Installation/ requirements

Please note that `react` version 16.3 or higher is required for this library to work because it is using the context as well as references api.

```
npm install --save react-stickup
```

## Usage

### Sticky

Acts like `position: sticky` css property but with better browser support.
By default the component will stick until the top offset is reached, but it is also possible to attache a container by reference the `Sticky` component cannot escape from.

``` javascript
import * as React from 'react';
import { Sticky } from 'react-stickup';

const container = React.createRef();

render(
  <>
    <div ref={container}>
      <Sticky container={container}>
        <Header>My Header</Header>
      </Sticky>
      <div style={{ height: '5000px' }}>
        Lots of content
      </div>
    </div>
    <Sticky>
      <Header>My Header</Header>
    </Sticky>
  </>,
  document.querySelector('main')
);
```

### StickyScrollUp

Only Sticky to the top of the page in case it the page is scrolled up. When scrolled down, the content will just scroll out. `Sticky` next to the `StickyScrollUp` will stick to the bottom of it.

**Important**: To work the `StickyScrollUp` component requires to have `StickyScrollUpProvider` somewhere as a parent. Also the `Sticky` component must have the `StickyScrollUpProvider` as parent in case it should be able to interact with the `StickyScrollUp` component.

``` javascript
import * as React from 'react';
import { Sticky, StickyScrollUp, StickyScrollUpProvider } from 'react-stickup';

const container = React.createRef();

render(
  <StickyScrollUpProvider>
    <StickyScrollUp>
      My Stick up container
    </StickyScrollUp>
    <div ref={container}>
      <Sticky container={container}>
        <Header>My Header</Header>
      </Sticky>
      <div style={{ height: '5000px' }}>
        Lots of content
      </div>
    </div>
  </StickyScrollUpProvider>,
  document.querySelector('main')
);
```

## License

Licensed under the [MIT License](https://opensource.org/licenses/mit-license.php).
