import * as React from 'react';
import { IRect } from 'react-viewport-utils';

interface IElementResizeObserverProps {
  stickyRef: React.RefObject<any>;
  onUpdate: (rect: IRect) => void;
}

class ElementResizeObserver extends React.PureComponent<
  IElementResizeObserverProps
> {
  private resizeObserver: ResizeObserver | null;
  constructor(props: IElementResizeObserverProps) {
    super(props);
    this.resizeObserver = null;
  }

  componentDidMount() {
    this.resetObserver();
    this.installObserver();
  }

  componentDidUpdate() {
    this.resetObserver();
    this.installObserver();
  }

  componentWillUnmount() {
    this.resetObserver();
  }

  installObserver() {
    if (!this.props.stickyRef.current) {
      return;
    }
    if (typeof window.ResizeObserver !== 'undefined') {
      this.resizeObserver = new window.ResizeObserver(entries => {
        if (entries && entries[0] && entries[0].contentRect) {
          this.props.onUpdate(entries[0].contentRect);
        }
      });
      this.resizeObserver!.observe(this.props.stickyRef.current);
    }
  }

  resetObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  render(): null {
    return null;
  }
}

export default ElementResizeObserver;
