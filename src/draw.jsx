import React from 'react';
import { Box, Grid, GridItem, IconButton } from '@chakra-ui/react';
import Color from 'color';
import { FormRefresh } from 'grommet-icons';

import { useAppState, useDrawingContext } from './state.jsx';
import { Canvas } from './state-canvas.jsx';

export const Draw = () => {
  const {
    canvasTransform,
    resetApp,
  } = useAppState();

  const sidebarWidth = '50px';
  const bottombarHeight = '100px';

  return (
    <Grid
      templateAreas={`'canvas sidebar'
                      'bottombar bottombar'`}
      gridTemplateColumns={`1fr ${sidebarWidth}`}
      gridAutoRows={`1fr ${bottombarHeight}`}
      gap="0"
      h="100%"
    >
      <GridItem area="canvas" style={{
        overflow: 'hidden',
        borderRight: `1px solid ${Color('#EAE8FF').darken(.1).hex()}`,
        borderBottom: `1px solid ${Color('#EAE8FF').darken(.1).hex()}`,
        background: '#EAE8FF',
        borderRadius: '0 0 10px 0'
      }}>
        <Canvas />
      </GridItem>

      <GridItem area="sidebar">
        <Box id="file-controls">
          <IconButton
            aria-label='Reset App'
            onClick={resetApp}
            icon={<FormRefresh />}
          />
          <IconButton
            aria-label='Reset App'
            onClick={resetApp}
            icon={<FormRefresh />}
          />
          <IconButton
            aria-label='Reset App'
            onClick={resetApp}
            icon={<FormRefresh />}
          />
        </Box>
      </GridItem>

      <GridItem area="bottombar">
        <Box id="file-controls">
          <IconButton
            aria-label='Reset App'
            onClick={resetApp}
            icon={<FormRefresh />}
          />
          <IconButton
            aria-label='Reset App'
            onClick={resetApp}
            icon={<FormRefresh />}
          />
          <IconButton
            aria-label='Reset App'
            onClick={resetApp}
            icon={<FormRefresh />}
          />
        </Box>
      </GridItem>
    </Grid>
  );
};
