import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Premium WebGL Interactive 3D Spatial Location Node Globe
 * Renders a glowing holographic wireframe globe with spatial nodes
 * representing major AP property hotspots.
 */

// Bouncing Hotspot Node Component inside 3D Canvas
function ActiveHotspotNode({ position, name, count, color = '#e8b84b' }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  // Bouncing micro-animation
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const elapsed = clock.getElapsedTime();
      const scale = 1 + Math.sin(elapsed * 5) * 0.12;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={hovered ? '#fff' : color} toneMapped={false} />
      </mesh>

      {/* Halo pulse ring */}
      <mesh scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} wireframe />
      </mesh>

      {/* Floating 3D Spatial Glass Tooltip */}
      <Html distanceFactor={4} style={{ pointerEvents: 'none' }}>
        <div style={{
          transform: 'translate(-50%, -125%)',
          background: 'rgba(5, 7, 18, 0.92)',
          border: hovered ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.12)',
          boxShadow: hovered ? '0 0 15px rgba(232,184,75,0.3)' : '0 8px 32px rgba(0,0,0,0.5)',
          padding: '6px 12px',
          borderRadius: '10px',
          color: '#fff',
          fontSize: '0.62rem',
          fontWeight: 900,
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px'
        }}>
          <span style={{ color: hovered ? 'var(--gold)' : 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {name}
          </span>
          <span style={{ color: '#10d98c', fontSize: '0.58rem' }}>
            ✦ {count} Assets Live
          </span>
        </div>
      </Html>
    </group>
  );
}

// Rotating Wireframe Globe Core Component
function GlobeSphere() {
  const globeRef = useRef();

  useFrame(() => {
    if (globeRef.current) {
      // Gentle, elegant slow rotation
      globeRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Semi-transparent Glass Sphere base */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial 
          color="#0f172a" 
          transparent 
          opacity={0.35} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* Holographic glowing wireframe lines */}
      <mesh>
        <sphereGeometry args={[1.51, 24, 24]} />
        <meshBasicMaterial 
          color="#e8b84b" 
          wireframe 
          transparent 
          opacity={0.065} 
        />
      </mesh>

      {/* Latitudinal glowing orbit ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.52, 64]} />
        <meshBasicMaterial color="#e8b84b" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>

      {/* Key Andhra Pradesh property hotspots mapped in spherical coordinate systems */}
      <ActiveHotspotNode position={[0.7, 0.8, 1.1]} name="Amaravati Capital" count={124} color="#e8b84b" />
      <ActiveHotspotNode position={[0.3, 0.2, 1.4]} name="Vijayawada Hub" count={85} color="#22d9e0" />
      <ActiveHotspotNode position={[-0.4, -0.6, 1.3]} name="Guntur Central" count={92} color="#9b59f5" />
      <ActiveHotspotNode position={[1.2, -0.3, 0.8]} name="Vizag Smart City" count={148} color="#10d98c" />
    </group>
  );
}

export default function Interactive3DGlobe() {
  return (
    <div style={{ width: '100%', height: '100%', cursor: 'grab' }}>
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        
        <GlobeSphere />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}
