# React Stickup

React components to stick elements at the top of the page while scrolling.

![](https://img.shields.io/npm/l/react-stickup.svg)
[![](https://img.shields.io/npm/v/react-stickup.svg)](https://www.npmjs.com/package/react-stickup)
![](https://img.shields.io/david/garthenweb/react-stickup.svg)
[![](https://img.shields.io/bundlephobia/minzip/react-stickup.svg)](https://bundlephobia.com/result?p=react-stickup)
[![Build Status](https://travis-ci.org/garthenweb/react-stickup.svg?branch=master)](https://travis-ci.org/garthenweb/react-stickup)

## Features

* [`Sticky`](#sticky) component like `position: sticky` with options for elements bigger than the viewport
* [`StickyScrollUp`](#stickyscrollup) component that is only visible when scrolling up (like the Chrome Browser url bar on Android)
* Support for modern browsers (including IE11)
* Build with performance in mind: Blazing fast, even on low end devices
* Typescript

[See the example to see how the library will work in production.](http://garthenweb.github.io/react-stickup)

## Installation

```
npm install --save react-stickup
```

## Requirements

* [react](https://reactjs.org/) version `16.3` or higher

## Static Types

* Support for [Typescript](https://www.typescriptlang.org/) is included within this library, no need to install additional packages
* [Flow](https://flow.org/en/) is not supported (feel free to create a PR)

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

**`children?: React.ReactNode | ((options: { isSticky: boolean, isDockedToBottom: boolean, isNearToViewport: boolean, appliedOverflowScroll: 'end' | 'flow' }) => React.ReactNode)`**

The child node that is rendered within the sticky container. When rendered as a function it will add further information the the function which can be used e.g. to update stylings.

**`container?: React.RefObject<any>`**

The reference to the container to stick into. If this is not set, the component will be sticky regardless how far the user scrolls down.

**`defaultOffsetTop?: number`**

A top offset to create a padding between the browser window and the sticky component when sticky.

**`overflowScroll?: 'end' | 'flow'`**

Defines how the sticky element should react in case its bigger than the viewport.
Different options are available:

* `end`: The default value will keep the component sticky as long as it reaches the bottom of its container and only then will scroll down.
* `flow`: The element scrolls with the flow of the scroll direction, therefore the content is easier to access.

**`disabled?: boolean`**

Allows to disable all sticky behavior. Use this in case you need to temporary disable the sticky behavior but you don't want to unmount it for performance reasons.

**`disableHardwareAcceleration?: boolean`**

By default css styles for hardware acceleration (`will-change` if supported, otherwise falls back to `transform`) are activated. This allows to turn it off.

**`disableResizing?: boolean`**

The components will resize when the width of the window changes to adjust its height and width. This allows to turn the resizing off.

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

**`disabled?: boolean`**

Allows to disable all sticky behavior. Use this in case you need to temporary disable the sticky behavior but you don't want to unmount it for performance reasons.

**`disableHardwareAcceleration?: boolean`**

By default css styles for hardware acceleration (`will-change` if supported, otherwise falls back to `transform`) are activated. This allows to turn it off.

**`disableResizing?: boolean`**

The components will resize when the width of the window changes to adjust its height and width. This allows to turn the resizing off.

**`stickyProps?: {}`**

All properties within this object are spread directly into the sticky element within the component. This e.g. allows to add css styles by `className` or `style`.

**`style?: React.CSSProperties`**

Will be merged with generated styles of the placeholder element. It also allows to override generated styles.

**`className?: string`**

The class name is passed directly to the placeholder element.

**`defaultOffsetTop?: number`**

DEPRECATED: If not set, the start position is now calculated by default as it was already the case for the `Sticky` component. As there is no use case for this property anymore it will be removed in the future.

When not initialized as the first element within the page (directly at the top) this allows to set an offset by hand from where the component will be sticky.

## Contributing

Contributions are highly appreciated! The easiest is to fill an issue in case there is one before providing a PR so we can discuss the issue and a possible solution up front.

At the moment there is not a test suite because its tricky to test the sticky behavior automated. I consider creating some e2e tests with Cypress in the future. In case you are interested in helping on that, please let me know!

For now, please make sure to add a test case for all features in the examples.

To start the example with the recent library changes just run `npm start` on the command.

## License

Licensed under the [MIT License](https://opensource.org/licenses/mit-license.php).
