import React, { createContext, useContext, useEffect } from 'react';
import { signal, batch, effect, computed } from '@preact/signals-react';

import { useDB } from './state-db.jsx';

const State = createContext();
State.displayName = 'StateContext';

const dbKeys = {
  originalImageData: 'original-image-data'
};

// TODO do we need to debounce saves?
export const dbSignal = (key, initialValue, { load, save } = {}) => {
  const db = useDB();
  const sig = signal(initialValue);

  // attempt to load value from the database once
  useEffect(() => {
    if (load) {
      return void load();
    }

    db.get(key).then(value => {
      sig.value = value;
    }).catch(err => {
      console.log(`failed to load "${key}" data:`, err);
    });
  }, []);

  // save whenever the value changes
  effect(() => {
    if (save) {
      return void save();
    }

    db.set(key, sig.value).catch(err => {
      console.log(`failed to persist "${key}" data:`, err);
    });
  });

  return sig;
};

export const withAppState = Component => ({ children, ...props }) => {
  const route = signal('loading');
  const layers = signal([]);
  const activeLayer = dbSignal('active-layer', 0);
  const originalImageData = signal(undefined);
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

  effect(() => {
    if (layers.value.length === 0) {
      batch(() => {
        layers.value = [document.createElement('canvas')];
        activeLayer.value = 0;
      });
    }
  })

  // keep all canvases in sync with the original image data size
  effect(() => {
    const imageData = originalImageData.value;

    if (!imageData) {
      return;
    }

    const { width, height } = imageData;

    for (const canvas of layers.value) {
      canvas.width = width;
      canvas.height = height;
    }
  });

  // apply canvas transform when the single signal value is changed
  effect(() => {
    const transform = canvasTransform.value;

    for (const canvas of layers.value) {
      canvas.style.transform = transform;
    }
  });

  return (
    <State.Provider value={{
      activeLayer,
      layers,
      canvasTransform,
      originalImageData,
      route,
      // helper methods
      batch,
      effect
    }}>
      <Component {...props}>{children}</Component>
    </State.Provider>
  );
};

export const useAppState = () => useContext(State);
