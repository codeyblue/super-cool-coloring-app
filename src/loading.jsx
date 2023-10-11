import React from 'react';
import { Spinner, Box, Main, Text } from 'grommet';
import styled from 'styled-components';

const RAINBOW_GRADIENT = 'radial-gradient(circle at 50% -3.03%, hsla(327, 100%, 70%, 1) 10%, hsla(52, 99%, 62%, 1) 40%, hsla(172, 100%, 48%, 1) 55%, hsla(195, 100%, 49%, 1) 80%, hsla(245, 100%, 95%, 1) 100%)';

const BounceSpinner = styled(Spinner)`
  animation-name: bounce-1;
  animation-timing-function: ease;
  animation-duration: 1s;
  animation-iteration-count: infinite;
  @keyframes bounce-1 {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-100px);
    }
    100% {
      transform: translateY(0);
    }
  }
`;

export const Loading = () => {
  return (
    <Main full background="brand-bg">
      <Box flex justify="center" align="center" direction="row" gap="large">
        <BounceSpinner
          background={RAINBOW_GRADIENT}
          border={false}
          size="medium"
        /><Text color="secondary" size="xlarge" weight="bold">LOADING...</Text>
      </Box>
    </Main>
  );
};
