import React, { createContext, useContext, useEffect } from 'react';
import { signal, batch, effect, computed } from '@preact/signals-react';

import { useDB } from './state-db.jsx';

const State = createContext();
State.displayName = 'StateContext';

const dbKeys = {
  originalImageData: 'original-image-data'
};

export const withAppState = Component => ({ children, ...props }) => {
  const route = signal('loading');
  const originalImageData = signal(undefined);
  const canvas = signal(document.createElement('canvas'));
  const originalCanvas = signal(document.createElement('canvas'));
  const canvasTransform = signal('');

  const db = useDB();

  // this is a private copy that will be used for the database only
  const originalImageDataFastCopy = computed(() => {
    const imageData = originalImageData.value;

    if (!imageData) {
      return;
    }

    return {
      data: [...imageData.data],
      width: imageData.width,
      height: imageData.height
    };
  });

  let nextSave;
  let savingInProgress = false;

  // initialize state values stored in the database at load
  useEffect(() => {
    (async () => {
      try {
        const value = await db.get(dbKeys.originalImageData);

        if (!value) {
          throw new Error(`no persisted state data for "${dbKeys.originalImageData}"`);
        }

        const {
          originalImageData: savedImageData,
        } = value;

        const imageData = new ImageData(
          new Uint8ClampedArray(savedImageData.data),
          savedImageData.width,
          savedImageData.height
        );

        batch(() => {
          originalImageData.value = imageData;
          route.value = 'display';
        });
      } catch (e) {
        console.log('failed to recover image data from state database:', e);
        route.value = 'upload';
      }
    })();
  }, [/* run only once */]);

  // persist state to database when the values change
  effect(() => {
    const persistedData = {
      originalImageData: originalImageDataFastCopy.value
    };

    if (!originalImageData.value) {
      return;
    }

    const saveFunc = () => {
      savingInProgress = true;

      db.set(dbKeys.originalImageData, persistedData).catch(err => {
        console.log('failed to persist state data:', err);
      }).finally(() => {
        savingInProgress = false;

        if (nextSave) {
          nextSave();
          nextSave = null;
        }
      });
    };

    if (savingInProgress) {
      nextSave = saveFunc;
    } else {
      saveFunc();
    }
  });

  // keep all canvases in sync with the original image data size
  effect(() => {
    const imageData = originalImageData.value;

    if (!imageData) {
      return;
    }

    const { width, height } = imageData;

    canvas.value.width = width;
    canvas.value.height = height;

    originalCanvas.value.width = width;
    originalCanvas.value.height = height;
  });

  // apply canvas transform when the single signal value is changed
  effect(() => {
    const transform = canvasTransform.value;
    canvas.value.style.transform = transform;
    originalCanvas.value.style.transform = transform;
  });

  return (
    <State.Provider value={{
      canvas,
      originalCanvas,
      canvasTransform,
      originalImageData,
      route,
      // helper methods
      batch
    }}>
      <Component {...props}>{children}</Component>
    </State.Provider>
  );
};

export const useAppState = () => useContext(State);
