# React Stickup

The goal of this project is to create a set of components that create a sticky behavior and are able to interact with each other. [See an example here](http://garthenweb.github.io/react-stickup).

## Installation/ requirements

Please note that `react` version 16.3 or higher is required for this library to work because it is using the context as well as references api.

```
npm install --save react-stickup
```

## Usage

### StickyProvider

This component does not render anything but is required as a parent for `Sticky` and `StickyScrollUp` component to work. It will take care of registration of event handlers and provides a communication channel between components.

### Sticky

Acts like `position: sticky` css property but with better browser support.
By default the component will stick until the top offset is reached, but it is also possible to attache a container by reference the `Sticky` component cannot escape from.

**Important**: To work properly the `Sticky` component must have a `StickyProvider` as a parent within the tree.

Allows to set the following properties:

* `container?: React.RefObject<any>`: the reference to the container to stick into. If this is not set, the component will be sticky regardless how far the user scrolls down.
* `children?: React.ReactNode | ((options: { isSticky: boolean, isDockedToBottom: boolean }) => React.ReactNode)`: the child node that is rendered within the sticky container. When rendered as a function it will add further information the the function (see types).
* `defaultOffsetTop?: number`: a top offset to create a padding between the browser window and other components.
* `disableHardwareAcceleration?: boolean`: By default css styles for hardware acceleration are activated. This allows to turn it off.
* `disableResizing?: boolean`: the components will resize when the width of the window changes to adjust its height and with. This allows to turn it off.
* `disabled?: boolean`: allows to disable all sticky behavior. Please note that this will not remove the created elements.
* `stickyProps?: {}`: all properties within this object are spread directly into the sticky element within the component. This e.g. allows to add css styles by `className` or `style`.
* `style?: React.CSSProperties`: will be merged with generated styles of the placeholder element.
* `className?: string`: will be added to the placeholder element.

``` javascript
import * as React from 'react';
import { Sticky } from 'react-stickup';

const container = React.createRef();

render(
  <StickyProvider>
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
  </StickyProvider>,
  document.querySelector('main')
);
```

### StickyScrollUp

Only Sticky to the top of the page in case it the page is scrolled up. When scrolled down, the content will just scroll out. `Sticky` next to the `StickyScrollUp` will stick to the bottom of it.

**Important**: To work properly the `StickyScrollUp` component must have a `StickyProvider` as a parent within the tree. All `Sticky` must be wrapped by the same instance of the `StickyProvider`as the `StickyScrollUp` component.

Allows to set the following properties:

* `children?: React.ReactNode | (() => React.ReactNode)`: the child node that is rendered within the sticky container.
* `defaultOffsetTop?: number`: when not initialized as the first element within the page this allows to set an offset by hand.
* `disableHardwareAcceleration?: boolean`: By default css styles for hardware acceleration are activated. This allows to turn it off.
* `disableResizing?: boolean`: the components will resize when the width of the window changes to adjust its height and with. This allows to turn it off.
* `disabled?: boolean`: allows to disable all sticky behavior. Please note that this will not remove the created elements.
* `stickyProps?: {}`: all properties within this object are spread directly into the sticky element within the component. This e.g. allows to add css styles by `className` or `style`.
* `style?: React.CSSProperties`: will be merged with generated styles of the placeholder element.
* `className?: string`: will be added to the placeholder element.

``` javascript
import * as React from 'react';
import { Sticky, StickyScrollUp, StickyProvider } from 'react-stickup';

const container = React.createRef();

render(
  <StickyProvider>
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
  </StickyProvider>,
  document.querySelector('main')
);
```

## License

Licensed under the [MIT License](https://opensource.org/licenses/mit-license.php).
