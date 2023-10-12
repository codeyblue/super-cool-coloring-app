import React from 'react';
import { useSignal, batch, computed } from '@preact/signals-react';

import { FileUploader } from 'react-drag-drop-files';
import { useAppState } from './state.jsx';

const loadUrl = (img, url) => {
  return new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = e => reject(e);
    img.src = url;
  });
};

export const Upload = () => {
  const { originalImageData, route, batch: batchAppState } = useAppState();

  const originalImage = useSignal(null);

  const previewCanvas = useSignal(document.createElement('canvas'));
  const previewCtx = computed(() => previewCanvas.value.getContext('2d'));
  const previewImageData = useSignal(null);

  const onFileChange = file => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    loadPreview(img, url);
    URL.revokeObjectURL(file);
  };

  const loadDemoImage = async () => {
    const img = new Image();
    const response = await fetch('./demo-image.jpg');
    loadPreview(img, response.url);
  };

  const loadPreview = (img, url) => {
    const preview = document.getElementById('preview');

    loadUrl(img, url).then(() => {
      // create a thumbnail
      const { naturalWidth, naturalHeight } = img;
      const scale = Math.min(300 / naturalWidth, 300 / naturalHeight, 1);

      const width = naturalWidth * scale;
      const height = naturalHeight * scale;
      const ctx = previewCtx.value;

      console.log({ width, height, ctx });

      batch(() => {
        // save this to use later
        originalImage.value = img;

        previewCanvas.value.width = width;
        previewCanvas.value.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        previewImageData.value = ctx.getImageData(0, 0, width, height);
      });
      preview.appendChild(previewCanvas.value);
    });
  };

  const submit = (e) => {
    e.preventDefault();

    const { naturalWidth, naturalHeight } = originalImage.value;
    const scale = Math.min(1000 / naturalWidth, 1000 / naturalHeight, 1);

    const width = naturalWidth * scale;
    const height = naturalHeight * scale;

    previewCanvas.value.width = width;
    previewCanvas.value.height = height;

    const ctx = previewCtx.value;

    ctx.drawImage(originalImage.value, 0, 0, width, height);

    // if we are in lineart mode, generate the outline for the large image

    batchAppState(() => {
      originalImageData.value = ctx.getImageData(0, 0, width, height);
      route.value = 'display';
    });
  };

  const themeOverrides = {
    rangeInput: {
      thumb: {
        color: 'accent'
      },
      track: {
        lower: {
          color: 'secondary',
          opacity: 1
        },
        upper: {
          color: 'tertiary',
          opacity: .5
        }
      }
    },
    checkBox: {
      color: 'accent',
      toggle: {
        color: 'brand'
      }
    }
  };

  return (
      <div background="brand-bg" kind="narrow" align="center" height="100%">
        <div>Super Cool Coloring App</div>
        <div align="center" flex="grow">
            <div>This is a super fun art app created by <strong className="alex">Alexandra</strong>, <strong className="kiril">Kiril</strong>, and <strong className="kyla">Kyla</strong></div>
            <p>To get started, go ahead and upload an image.</p>
            <div className='uploader-container'>
              <FileUploader handleChange={onFileChange} name="file" types={['JPG', 'JPEG', 'PNG']} />
            </div>
            <div id='preview' />
            <button onClick={submit}>Start</button>
        </div>
        <div id="footer" pad="large">
          <p>Too lazy to upload an image yourself?</p>
          <button onClick={loadDemoImage}>Load Demo Image</button>
        </div>
      </div>
  );
};
