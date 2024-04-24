import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedMesh({ isAnimating }) {
  const mesh = useLoader(THREE.ObjectLoader, 'tree1.json');
  const ref = useRef();

  useEffect(() => {
    if (mesh) {
      const box = new THREE.Box3().setFromObject(mesh);
      const center = box.getCenter(new THREE.Vector3());
      mesh.position.sub(center);  // Center the mesh within the scene
    }
  }, [mesh]);

  useFrame(() => {
    if (ref.current && isAnimating) {
      ref.current.rotation.y += 0.002;  // Rotate the mesh only if isAnimating is true
    }
  });

  return mesh ? <primitive object={mesh} ref={ref} /> : null;
}

function ThreeScene() {
  const [theme, setTheme] = useState('dark');  // Set default theme to dark
  const [isAnimating, setIsAnimating] = useState(true);  // Animation is on by default

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);  // Toggle animation on and off
  };

  const themeStyles = {
    backgroundColor: theme === 'light' ? '#fff' : '#333',
    color: theme === 'light' ? '#333' : '#fff'
  };

  const themeButtonStyle = {
    position: 'absolute', top: '20px', right: '160px', zIndex: 1000,
    backgroundColor: '#dcdcdc',  // Pastel grey for both themes
    color: '#000',  // Black font color
    border: 'none', cursor: 'pointer', padding: '10px 20px'
  };

  const animationButtonStyle = {
    position: 'absolute', top: '20px', right: '20px', zIndex: 1000,
    backgroundColor: isAnimating ? '#ffb3ba' : '#bae1ff',  // Pastel red and blue
    color: '#000',  // Black font color
    border: 'none', cursor: 'pointer', padding: '10px 20px'
  };

  return (
    <div style={{ width: '100vw', height: '100vh', ...themeStyles }}>
      <Canvas
        camera={{ position: [0, 0, 20], fov: 50 }}
        style={{ background: themeStyles.backgroundColor }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color={themeStyles.color} />
        <AnimatedMesh isAnimating={isAnimating} />
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      </Canvas>
      <button onClick={toggleTheme} style={themeButtonStyle}>
        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </button>
      <button onClick={toggleAnimation} style={animationButtonStyle}>
        {isAnimating ? 'Stop Animating' : 'Start Animating'}
      </button>
    </div>
  );
}

export default ThreeScene;
