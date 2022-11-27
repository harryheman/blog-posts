import { OrbitControls } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { DoubleSide, TextureLoader } from "three";
import "./App.css";
// import Sphere from "./components/Sphere";
// import Earth from "./components/Earth";
import Skull from "./components/Skull";

import texture from "/lava.jpg";

function App() {
  const textureMap = useLoader(TextureLoader, texture);

  return (
    <div className="App">
      <Canvas
        camera={{
          fov: 90,
          position: [0, 0, 3],
        }}
      >
        <ambientLight intensity={0.1} />
        <directionalLight position={[1, 1, 1]} intensity={0.8} />
        {/* <Sphere /> */}
        {/* <Earth /> */}
        <OrbitControls />
        <Skull />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial map={textureMap} side={DoubleSide} />
        </mesh>
      </Canvas>
    </div>
  );
}

export default App;
