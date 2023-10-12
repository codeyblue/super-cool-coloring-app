import React from 'react';
import { Box, Button } from 'grommet';
import Color from 'color';
import { FormRefresh } from 'grommet-icons';

import { useAppState, useDrawingContext } from './state.jsx';
import { Canvas } from './state-canvas.jsx';

export const Draw = () => {
  const {
    canvasTransform,
    resetApp,
  } = useAppState();

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
      <div style={{
        overflow: 'hidden',
        borderRight: `1px solid ${Color('#EAE8FF').darken(.1).hex()}`,
        borderBottom: `1px solid ${Color('#EAE8FF').darken(.1).hex()}`,
        background: '#EAE8FF',
        borderRadius: '0 0 10px 0'
      }}>
        <Canvas />
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
