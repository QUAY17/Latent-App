import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "../shaders/fluid";

function FluidPlane({ seed }) {
  const meshRef = useRef();
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSeed: { value: seed },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
      meshRef.current.material.uniforms.uSeed.value = seed;
      meshRef.current.material.uniforms.uResolution.value.set(
        size.width,
        size.height
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function FluidBackground({ seed = 0 }) {
  return (
    <div className="player-panel__shader">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        gl={{ antialias: false, alpha: false }}
        style={{ width: "100%", height: "100%" }}
        dpr={[1, 1.5]}
      >
        <FluidPlane seed={seed} />
      </Canvas>
    </div>
  );
}
