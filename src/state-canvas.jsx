import React, { createRef, useLayoutEffect } from 'react';
import { useAppState } from './state.jsx';

// We will use a single global drawing canvas
// This is React component that inputs that
// single canvas as an unmanaged element into
// the DOM

export const Canvas = (props = {}) => {
  const { layers } = useAppState();
  const containerRef = createRef();

  useLayoutEffect(() => {
    if (containerRef && containerRef.current) {
      const canvases = layers.peek();

      for (const canvas of canvases) {
        Object.assign(canvas.style, {
          position: 'absolute',
          top: '0',
          left: '0',
          transformOrigin: '0 0',
          pointerEvents: 'none'
        });

        containerRef.current.appendChild(canvas);
      }
    }
  }, containerRef.current);

  return <div
    ref={containerRef}
    {...props}
    style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }}
  />
};
