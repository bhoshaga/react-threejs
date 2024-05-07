import React, { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { ObjectLoader } from 'three';
import { OrbitControls, Html, Center } from '@react-three/drei';
import axios from 'axios';
import './App.css';

const Model = ({ path }) => {
  const [model, setModel] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const response = await axios.get(path, { responseType: 'blob' });
        const contentType = response.headers['content-type'];
        const format = response.headers['x-format'];

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
            console.error('Unsupported file format');
            return;
        }

        const blob = new Blob([response.data], { type: contentType });
        const url = URL.createObjectURL(blob);

        const loadedModel = await loader.loadAsync(url);
        setModel(loadedModel);

        URL.revokeObjectURL(url);
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
      <div className="loading">Loading...</div>
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
    model4: 'https://api.stru.ai/v1/model/model_04',
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
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
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
          {isAnimating ? 'Stop Animation' : 'Start Animation'}
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

// import React, { useState, Suspense, useEffect } from 'react';
// import { Canvas } from '@react-three/fiber';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
// import { ObjectLoader } from 'three';
// import { OrbitControls, Html, Center } from '@react-three/drei';
// import axios from 'axios';
// import './App.css';

// const Model = ({ path }) => {
//   const [model, setModel] = useState(null);

//   useEffect(() => {
//     const loadModel = async () => {
//       try {
//         const response = await axios.get(path, { responseType: 'blob' });
//         const contentType = response.headers['content-type'];
//         const modelId = response.headers['x-model-id'];
//         const format = response.headers['x-format'];

//         let loader;
//         let fileExtension;

//         switch (format) {
//           case 'GLB':
//             loader = new GLTFLoader();
//             fileExtension = 'glb';
//             break;
//           case 'GLTF':
//             loader = new GLTFLoader();
//             fileExtension = 'gltf';
//             break;
//           case 'JSON':
//             loader = new ObjectLoader();
//             fileExtension = 'json';
//             break;
//           default:
//             console.error('Unsupported file format');
//             return;
//         }

//         const blob = new Blob([response.data], { type: contentType });
//         const url = URL.createObjectURL(blob);

//         const loadedModel = await loader.loadAsync(url);
//         setModel(loadedModel);

//         // Save the model file to the appropriate folder
//         const folderPath = `/models/${modelId}`;
//         const fileName = `scene.${fileExtension}`;
//         const fileUrl = `${folderPath}/${fileName}`;

//         // Create a temporary anchor element
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = fileName;

//         // Programmatically trigger the download
//         link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

//         setTimeout(() => {
//           URL.revokeObjectURL(url);
//           link.remove();
//         }, 100);
//       } catch (error) {
//         console.error('Failed to load model:', error);
//       }
//     };

//     loadModel();
//   }, [path]);

//   if (!model) {
//     return null;
//   }

//   return (
//     <Center>
//       <primitive object={model.scene || model} dispose={null} />
//     </Center>
//   );
// };

// const Loader = () => {
//   return (
//     <Html center>
//       <div className="loading">Loading...</div>
//     </Html>
//   );
// };

// const App = () => {
//   const [darkMode, setDarkMode] = useState(false);
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [selectedModel, setSelectedModel] = useState(null);

//   const modelPaths = {
//     model1: 'https://api.stru.ai/v1/model/model_01',
//     model2: 'https://api.stru.ai/v1/model/model_02',
//     model3: 'https://api.stru.ai/v1/model/model_03',
//     model4: 'https://api.stru.ai/v1/model/model_04',
//   };

//   const handleDarkModeToggle = () => {
//     setDarkMode(!darkMode);
//   };

//   const handleAnimationToggle = () => {
//     setIsAnimating(!isAnimating);
//   };

//   const handleModelClick = (model) => {
//     setSelectedModel(model);
//   };

//   const handleClearScene = () => {
//     setSelectedModel(null);
//   };

//   return (
//     <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
//       <h1>3D Model Viewer</h1>
//       <div className="viewer-container">
//         <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
//           <Suspense fallback={<Loader />}>
//             {selectedModel && <Model path={modelPaths[selectedModel]} />}
//             <OrbitControls autoRotate={isAnimating} />
//             <ambientLight intensity={0.5} />
//             <pointLight position={[10, 10, 10]} />
//           </Suspense>
//         </Canvas>
//       </div>
//       <div className="controls">
//         <button onClick={handleDarkModeToggle}>
//           {darkMode ? 'Light Mode' : 'Dark Mode'}
//         </button>
//         <button onClick={handleAnimationToggle}>
//           {isAnimating ? 'Stop Animation' : 'Start Animation'}
//         </button>
//       </div>
//       <div className="model-selector">
//         <button onClick={() => handleModelClick('model1')}>Model 1</button>
//         <button onClick={() => handleModelClick('model2')}>Model 2</button>
//         <button onClick={() => handleModelClick('model3')}>Model 3</button>
//         <button onClick={() => handleModelClick('model4')}>Model 4</button>
//         <button onClick={handleClearScene}>Clear Scene</button>
//       </div>
//     </div>
//   );
// };

// export default App;


// import React, { useState, Suspense, useEffect } from 'react';
// import { Canvas } from '@react-three/fiber';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
// import { ObjectLoader } from 'three';
// import { OrbitControls, Html, Center } from '@react-three/drei';
// import './App.css';

// const Model = ({ path }) => {
//   const [model, setModel] = useState(null);

//   useEffect(() => {
//     const loadModel = async () => {
//       const fileExtensions = ['gltf', 'glb', 'json'];
//       let loader;

//       for (const extension of fileExtensions) {
//         const filePath = `${path}/scene.${extension}`;

//         try {
//           switch (extension) {
//             case 'gltf':
//               loader = new GLTFLoader();
//               const dracoLoader = new DRACOLoader();
//               dracoLoader.setDecoderPath('/draco/');
//               loader.setDRACOLoader(dracoLoader);
//               break;
//             case 'glb':
//               loader = new GLTFLoader();
//               break;
//             case 'json':
//               loader = new ObjectLoader();
//               break;
//             default:
//               console.error('Unsupported file format');
//               return;
//           }

//           const loadedModel = await loader.loadAsync(filePath);
//           setModel(loadedModel);
//           break;
//         } catch (error) {
//           console.error(`Failed to load ${filePath}:`, error);
//         }
//       }
//     };

//     loadModel();
//   }, [path]);

//   if (!model) {
//     return null;
//   }

//   return (
//     <Center>
//       <primitive object={model.scene || model} dispose={null} />
//     </Center>
//   );
// };

// const Loader = () => {
//   return (
//     <Html center>
//       <div className="loading">Loading...</div>
//     </Html>
//   );
// };

// const App = () => {
//   const [darkMode, setDarkMode] = useState(false);
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [selectedModel, setSelectedModel] = useState(null);

//   const modelPaths = {
//     model1: '/models/model1',
//     model2: '/models/model2',
//     model3: '/models/model3',
//     model4: '/models/model4',
//   };

//   const handleDarkModeToggle = () => {
//     setDarkMode(!darkMode);
//   };

//   const handleAnimationToggle = () => {
//     setIsAnimating(!isAnimating);
//   };

//   const handleModelClick = (model) => {
//     setSelectedModel(model);
//   };

//   const handleClearScene = () => {
//     setSelectedModel(null);
//   };

//   return (
//     <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
//       <h1>3D Model Viewer</h1>
//       <div className="viewer-container">
//         <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
//           <Suspense fallback={<Loader />}>
//             {selectedModel && <Model path={modelPaths[selectedModel]} />}
//             <OrbitControls autoRotate={isAnimating} />
//             <ambientLight intensity={0.5} />
//             <pointLight position={[10, 10, 10]} />
//           </Suspense>
//         </Canvas>
//       </div>
//       <div className="controls">
//         <button onClick={handleDarkModeToggle}>
//           {darkMode ? 'Light Mode' : 'Dark Mode'}
//         </button>
//         <button onClick={handleAnimationToggle}>
//           {isAnimating ? 'Stop Animation' : 'Start Animation'}
//         </button>
//       </div>
//       <div className="model-selector">
//         <button onClick={() => handleModelClick('model1')}>Model 1</button>
//         <button onClick={() => handleModelClick('model2')}>Model 2</button>
//         <button onClick={() => handleModelClick('model3')}>Model 3</button>
//         <button onClick={() => handleModelClick('model4')}>Model 4</button>
//         <button onClick={handleClearScene}>Clear Scene</button>
//       </div>
//     </div>
//   );
// };

// export default App;