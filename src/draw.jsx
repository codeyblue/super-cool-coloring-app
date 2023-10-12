import React, { useEffect } from 'react';
import { Box, Button } from 'grommet';
import Color from 'color';
import { FormRefresh } from 'grommet-icons';

import { useDB } from './state-db.jsx'
import { useAppState } from './state.jsx';
import { StateCanvas, useActiveLayer } from './state-canvas.jsx';

export const Draw = () => {
  const {
    canvasTransform,
    originalImageData,
    route,
    batch
  } = useAppState();

  const db = useDB();

  const canvas = useActiveLayer();

  useEffect(() => {
    const ctx = canvas.getContext('2d');
    ctx.putImageData(originalImageData.value, 0, 0);
  }, [/* execute once */]);

  const clearImageData = () => {
    db.reset('original-image-data');

    batch(() => {
      originalImageData.value = undefined;
      route.value = 'upload';
    });
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
      <div style={{
        overflow: 'hidden',
        borderRight: `1px solid ${Color('#EAE8FF').darken(.1).hex()}`,
        borderBottom: `1px solid ${Color('#EAE8FF').darken(.1).hex()}`,
        background: '#EAE8FF',
        borderRadius: '0 0 10px 0'
      }}>
        <StateCanvas />
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <Box id="file-controls">
          <Button onClick={clearImageData} icon={<FormRefresh />} />
        </Box>
      </div>
    </div>
  );
};
