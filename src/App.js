import React, { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { ObjectLoader } from 'three';
import { OrbitControls, Html, Center } from '@react-three/drei';
import axios from 'axios';
import JSZip from 'jszip';
import './App.css';
import { Box3, Vector3 } from 'three';


const loadZippedModel = async (zip) => {
  const gltfFile = zip.file(/\.(gltf)$/i)[0];
  const binFile = zip.file(/\.bin$/i)[0];

  if (!gltfFile || !binFile) {
    throw new Error('Required files not found in the ZIP archive');
  }

  const gltfData = await gltfFile.async('string');
  const binData = await binFile.async('blob');

  const blobUrl = URL.createObjectURL(binData);

  // Replace the uri in the gltfData with the blobUrl for the .bin file
  const modifiedGLTFData = gltfData.replace(
    /"uri":\s*".*?\.bin"/,
    `"uri": "${blobUrl}"`
  );

  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');
  loader.setDRACOLoader(dracoLoader);

  return new Promise((resolve, reject) => {
    loader.parse(modifiedGLTFData, '', (gltf) => {
      URL.revokeObjectURL(blobUrl); // Clean up the blob URL after parsing
      resolve(gltf);
    }, (error) => {
      console.error('An error occurred during parsing:', error);
      URL.revokeObjectURL(blobUrl); // Ensure cleanup on failure as well
      reject(error);
    });
  });
};



const Model = ({ path }) => {
  const [model, setModel] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const response = await axios.get(path, { responseType: 'blob' });
        const contentType = response.headers['content-type'];
        const format = response.headers['x-format'];

        let loadedModel;

        if (format === 'ZIP') {
          const zip = await JSZip.loadAsync(response.data);
          loadedModel = await loadZippedModel(zip);
        } else {
          let loader;

          switch (format) {
            case 'GLB':
              loader = new GLTFLoader();
              break;
            case 'GLTF':
              loader = new GLTFLoader();
              const dracoLoader = new DRACOLoader();
              dracoLoader.setDecoderPath('/draco/');
              loader.setDRACOLoader(dracoLoader);
              break;
            case 'JSON':
              loader = new ObjectLoader();
              break;
            default:
              throw new Error('Unsupported file format');
          }

          const blob = new Blob([response.data], { type: contentType });
          const url = URL.createObjectURL(blob);

          loadedModel = await loader.loadAsync(url);

          URL.revokeObjectURL(url);
        }

        // Adjust the pivot point
        if (loadedModel.scene) {
          const bbox = new Box3().setFromObject(loadedModel.scene);
          const center = new Vector3();
          bbox.getCenter(center);
          loadedModel.scene.position.sub(center); // re-center the model
        }

        setModel(loadedModel);
      } catch (error) {
        console.error('Failed to load model:', error);
      }
    };

    loadModel();
  }, [path]);

  if (!model) {
    return null;
  }

  return (
    <Center>
      <primitive object={model.scene || model} dispose={null} />
    </Center>
  );
};

const Loader = () => {
  return (
    <Html center>
      <div>Loading...</div>
    </Html>
  );
};

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  const modelPaths = {
    model1: 'https://api.stru.ai/v1/model/model_01',
    model2: 'https://api.stru.ai/v1/model/model_02',
    model3: 'https://api.stru.ai/v1/model/model_03',
    model4: 'https://api.stru.ai/v1/model/model_05',
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleAnimationToggle = () => {
    setIsAnimating(!isAnimating);
  };

  const handleModelClick = (model) => {
    setSelectedModel(model);
  };

  const handleClearScene = () => {
    setSelectedModel(null);
  };

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <h1>3D Model Viewer</h1>
      <div className="viewer-container">
        <Canvas>
          <Suspense fallback={<Loader />}>
            {selectedModel && <Model path={modelPaths[selectedModel]} />}
            <OrbitControls autoRotate={isAnimating} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
          </Suspense>
        </Canvas>
      </div>
      <div className="controls">
        <button onClick={handleDarkModeToggle}>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button onClick={handleAnimationToggle}>
          {isAnimating ? 'Stop Animating' : 'Start Animating'}
        </button>
      </div>
      <div className="model-selector">
        <button onClick={() => handleModelClick('model1')}>Model 1</button>
        <button onClick={() => handleModelClick('model2')}>Model 2</button>
        <button onClick={() => handleModelClick('model3')}>Model 3</button>
        <button onClick={() => handleModelClick('model4')}>Model 4</button>
        <button onClick={handleClearScene}>Clear Scene</button>
      </div>
    </div>
  );
};

export default App;