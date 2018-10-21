# React Stickup

The goal of this project is to allow elements to stick to the top of the page while scrolling.

The `Sticky` component behaves equal to the css property `position: sticky`. There are already some components out there that do exactly that. Special about the *react-stickup* library is the `StickyScrollUp` component which is only sticky when the user scrolls up. This behavior is known e.g. from the Chrome Browser on Android.

[Please see the example for a better idea what this is about.](http://garthenweb.github.io/react-stickup)

## Installation

```
npm install --save react-stickup
```

## Requirements

* [react](https://reactjs.org/) version `16.3` or higher

## Static Types

* Support for [Typescript](https://www.typescriptlang.org/) is included within this library, no need to install addition packages
* [Flow](https://flow.org/en/) is not yet supported


## Client Support

This library aims to support the following clients

* Chrome/ Chrome Android (latest)
* Firefox (latest)
* Edge (latest)
* Safari/ Safari iOS (latest)
* NodeJS (latest)
* Internet Explorer 11 (with @babel/polyfill)

Please fill an issue in case your client is not supported or you see an issue in one of the above.

## Usage

### StickyProvider

This component is required as a parent for `Sticky` and `StickyScrollUp` component to work. It will take care of registration of event handlers and provides a communication channel between components. The main implementation is based on [react-viewport-utils](https://github.com/garthenweb/react-viewport-utils).

### Sticky

Acts like `position: sticky` css property.
By default the component will be sticky when the top offset is reached and will stay that way. In case it should only stick within a certain container it can get assigned as a reference.

**Important**: To work properly the `Sticky` component must have a `StickyProvider` as a parent within its tree.

#### Example

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

#### Properties

**`children?: React.ReactNode | ((options: { isSticky: boolean, isDockedToBottom: boolean, isNearToViewport: boolean }) => React.ReactNode)`**

The child node that is rendered within the sticky container. When rendered as a function it will add further information the the function which can be used e.g. to update stylings.

**`container?: React.RefObject<any>`**

The reference to the container to stick into. If this is not set, the component will be sticky regardless how far the user scrolls down.

**`defaultOffsetTop?: number`**

A top offset to create a padding between the browser window and the sticky component when sticky.

**`disabled?: boolean`**

Allows to disable all sticky behavior. Use this in case you need to temporary disable the sticky behavior but you don't want to unmount it for performance reasons.

**`disableHardwareAcceleration?: boolean`**

By default css styles for hardware acceleration (`will-change` if supported, otherwise falls back to `transform`) are activated. This allows to turn it off.

**`disableResizing?: boolean`**

The components will resize when the width of the window changes to adjust its height and with. This allows to turn the resizing off.

**`stickyProps?: {}`**

All properties within this object are spread directly into the sticky element within the component. This e.g. allows to add css styles by `className` or `style`.

**`style?: React.CSSProperties`**

Will be merged with generated styles of the placeholder element. It also allows to override generated styles.

**`className?: string`**

The class name is passed directly to the placeholder element.

### StickyScrollUp

Only Sticky to the top of the page in case it the page is scrolled up. When scrolled down, the content will just scroll out. `Sticky` next to the `StickyScrollUp` will stick to the bottom of it and will therefore not overlap.

**Important**: To work properly the `StickyScrollUp` component must have a `StickyProvider` as a parent within its tree. All `Sticky` components must be wrapped by the same instance of the `StickyProvider`as the `StickyScrollUp` component to not overlap.

#### Example

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

#### Properties

**`children?: React.ReactNode | ((options: { isSticky: boolean, isNearToViewport: boolean }) => React.ReactNode)`**

The child node that is rendered within the sticky container. When rendered as a function it will add further information the the function which can be used e.g. to update stylings.

**`defaultOffsetTop?: number`**

When not initialized as the first element within the page (directly at the top) this allows to set an offset by hand from where the component will be sticky. Its planned to do this automatically in the future, but the library is not there yet. See #11.

**`disabled?: boolean`**

Allows to disable all sticky behavior. Use this in case you need to temporary disable the sticky behavior but you don't want to unmount it for performance reasons.

**`disableHardwareAcceleration?: boolean`**

By default css styles for hardware acceleration (`will-change` if supported, otherwise falls back to `transform`) are activated. This allows to turn it off.

**`disableResizing?: boolean`**

The components will resize when the width of the window changes to adjust its height and with. This allows to turn the resizing off.

**`stickyProps?: {}`**

All properties within this object are spread directly into the sticky element within the component. This e.g. allows to add css styles by `className` or `style`.

**`style?: React.CSSProperties`**

Will be merged with generated styles of the placeholder element. It also allows to override generated styles.

**`className?: string`**

The class name is passed directly to the placeholder element.

## Contributing

Contributions are highly appreciated! The easiest is to fill an issue in case there is one before providing a PR so we can discuss the issue and a possible solution up front.

At the moment there is not a test suite because its tricky to test the sticky behavior automated. I consider creating some e2e tests with Cypress in the future. In case you are interested in helping on that, please let me know!

For now, please make sure to add a test case for all features in the examples.

To start the example with the recent library changes just run `npm start` on the command.

## License

Licensed under the [MIT License](https://opensource.org/licenses/mit-license.php).
