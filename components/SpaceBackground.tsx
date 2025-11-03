'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'

function NebulaClouds() {
  const cloudRef = useRef<THREE.Mesh>(null!)

  const vertexShader = `
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
      vPosition = position;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const fragmentShader = `
    uniform float uTime;
    varying vec3 vPosition;
    varying vec2 vUv;

    float noise(vec2 p) {
      return sin(p.x * 10.0 + uTime) * cos(p.y * 8.0 + uTime * 0.7) * 0.5 + 0.5;
    }

    void main() {
      vec2 uv = vUv;
      float n1 = noise(uv * 3.0);
      float n2 = noise(uv * 5.0 + vec2(100.0, 50.0));
      float n3 = noise(uv * 7.0 + vec2(200.0, 150.0));

      vec3 color1 = vec3(0.2, 0.0, 0.4); // Deep purple
      vec3 color2 = vec3(0.1, 0.2, 0.6); // Deep blue
      vec3 color3 = vec3(0.3, 0.0, 0.3); // Magenta

      vec3 finalColor = mix(color1, color2, n1);
      finalColor = mix(finalColor, color3, n2 * n3);

      float alpha = (n1 + n2 + n3) * 0.15;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), [])

  useFrame((state) => {
    if (cloudRef.current && cloudRef.current.material) {
      (cloudRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <mesh ref={cloudRef} position={[0, 0, -5]}>
      <planeGeometry args={[50, 30]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null!)

  const particleCount = 300
  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3

      // Create particles across the screen
      positions[i3] = (Math.random() - 0.5) * 60
      positions[i3 + 1] = (Math.random() - 0.5) * 40
      positions[i3 + 2] = (Math.random() - 0.5) * 20
    }

    return positions
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3

        // Gentle floating motion
        positions[i3 + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i * 0.1) * 0.002

        // Reset particles that go too high
        if (positions[i3 + 1] > 25) {
          positions[i3 + 1] = -25
        }
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation={true}
      />
    </points>
  )
}

export function SpaceBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{ background: 'linear-gradient(to bottom, #000011, #000033, #000044)' }}
      >
        <ambientLight intensity={0.1} />

        <NebulaClouds />
        <FloatingParticles />
        <Stars
          radius={100}
          depth={50}
          count={2000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />
      </Canvas>
    </div>
  )
}
