import React, { useEffect, createRef } from 'react';
import { Box, Button } from 'grommet';
import Color from 'color';
import { FormRefresh } from 'grommet-icons';

import { useAppState } from './state.jsx';
import { Canvas } from './state-canvas.jsx';

import { draw as pen } from './brushes/pen.js';

export const Draw = () => {
  const {
    activeContext,
    activeLayer,
    canvasTransform,
    resetApp,
  } = useAppState();

  const viewportRef = createRef();
  const { width, height } = activeLayer.peek() || {};

  useEffect(() => {
    if (width && height && viewportRef.current) {
      const padding = 10;
      const viewportRect = viewportRef.current.getBoundingClientRect();
      const scale = Math.min(1, (viewportRect.width - padding - padding) / width, (viewportRect.height - padding - padding) / height);
      const x = (viewportRect.width - (width * scale)) / 2;
      const y = (viewportRect.height - (height * scale)) / 2;

      canvasTransform.value = new DOMMatrix([scale, 0, 0, scale, x, y]);
    }
  }, [width, height, viewportRef.current]);

  const getCanvasPoint = ev => {
    const { offsetX, offsetY, pointerType: type, pressure = 0.5 } = ev;
    const point = new DOMPoint(offsetX, offsetY);
    const matrix = DOMMatrix.fromMatrix(canvasTransform.peek()).invertSelf();
    const { x, y } = point.matrixTransform(matrix);

    return { x, y, pressure, type };
  };

  const cancelEvent = ev => {
    ev.preventDefault();
    ev.stopPropagation();
  };

  const onDown = ev => {
    cancelEvent(ev);

    // TODO passive?
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    // const { x, y, pressure, type} = getCanvasPoint(ev.nativeEvent);
  };

  const onMove = ev => {
    cancelEvent(ev);

    const { x, y, pressure, type} = getCanvasPoint(ev);

    const ctx = activeContext.peek();

    pen({ ctx, x, y, pressure, size: 10, color: '#ff0000' });
  };

  const onUp = ev => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };

  return (
    <div style={{
      '--sidebar-size': '50px',
      '--bottombar-size': '100px',
      display: 'grid',
      width: '100%',
      height: '100%',
      justifyItems: 'stretch',
      gridTemplateColumns: 'calc(100% - var(--sidebar-size)) var(--sidebar-size)',
      gridTemplateRows: 'calc(100% - var(--bottombar-size)) var(--bottombar-size)',
      background: '#ffffff'
    }}>
      <div ref={viewportRef} style={{
        overflow: 'hidden',
        borderRight: `1px solid ${Color('#EAE8FF').darken(.1).hex()}`,
        borderBottom: `1px solid ${Color('#EAE8FF').darken(.1).hex()}`,
        background: '#EAE8FF',
        borderRadius: '0 0 10px 0'
      }}>
        <Canvas onPointerDown={onDown} />
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <Box id="file-controls">
          <Button onClick={resetApp} icon={<FormRefresh />} />
        </Box>
      </div>
    </div>
  );
};
