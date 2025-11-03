'use client'

import { useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'

function FlyingCamera() {
  const { camera } = useThree()

  useFrame((state) => {
    // Create a flying through tunnel effect
    const time = state.clock.elapsedTime

    // Move camera forward continuously
    camera.position.z -= 0.5

    // Add some banking/rolling motion
    camera.rotation.z = Math.sin(time * 0.5) * 0.1

    // Slight up/down movement
    camera.position.y = Math.sin(time * 0.3) * 2

    // Keep camera from going too far back
    if (camera.position.z < -50) {
      camera.position.z = 20
    }
  })

  return null
}

function TunnelRings() {
  const ringsRef = useRef<THREE.Group>(null!)

  const rings = Array.from({ length: 20 }, (_, i) => ({
    position: [0, 0, -i * 5],
    radius: 8 - i * 0.2,
    id: i
  }))

  useFrame(() => {
    if (ringsRef.current) {
      ringsRef.current.position.z += 0.5

      // Reset rings when they pass the camera
      if (ringsRef.current.position.z > 20) {
        ringsRef.current.position.z = -100
      }
    }
  })

  return (
    <group ref={ringsRef}>
      {rings.map((ring) => (
        <mesh key={ring.id} position={ring.position as [number, number, number]}>
          <torusGeometry args={[ring.radius, 0.2, 8, 32]} />
          <meshBasicMaterial
            color={`hsl(${200 + ring.id * 10}, 70%, 60%)`}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  )
}

function EnergyParticles() {
  const particlesRef = useRef<THREE.Points>(null!)

  const particleCount = 2000
  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3

      // Create particles in a tunnel formation
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 6 + 2
      const depth = (Math.random() - 0.5) * 200

      positions[i3] = Math.cos(angle) * radius
      positions[i3 + 1] = Math.sin(angle) * radius
      positions[i3 + 2] = depth
    }

    return positions
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      const time = state.clock.elapsedTime

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3

        // Move particles toward camera
        positions[i3 + 2] += 0.8

        // Reset particles that passed the camera
        if (positions[i3 + 2] > 20) {
          const angle = Math.random() * Math.PI * 2
          const radius = Math.random() * 6 + 2
          positions[i3] = Math.cos(angle) * radius
          positions[i3 + 1] = Math.sin(angle) * radius
          positions[i3 + 2] = -100
        }

        // Add some swirling motion
        const swirl = Math.sin(time + i * 0.1) * 0.1
        positions[i3] += Math.cos(time * 2 + i * 0.1) * swirl
        positions[i3 + 1] += Math.sin(time * 2 + i * 0.1) * swirl
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
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation={true}
        vertexColors={false}
      />
    </points>
  )
}

function AdvancedPortalScene() {
  const energyFieldRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (energyFieldRef.current && energyFieldRef.current.material) {
      (energyFieldRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <>
      <FlyingCamera />
      <TunnelRings />
      <EnergyParticles />
      <Stars radius={400} depth={150} count={5000} factor={8} saturation={0} fade speed={0.3} />

      {/* Dynamic energy field */}
      <mesh ref={energyFieldRef} position={[0, 0, -8]}>
        <sphereGeometry args={[25, 64, 64]} />
        <shaderMaterial
          vertexShader={`
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec2 vUv;

            void main() {
              vPosition = position;
              vNormal = normal;
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float uTime;
            varying vec3 vPosition;
            varying vec2 vUv;

            void main() {
              vec3 pos = vPosition;
              float time = uTime;

              // Create flowing energy waves
              float wave1 = sin(pos.x * 0.1 + time * 2.0) * cos(pos.y * 0.1 + time * 1.5);
              float wave2 = sin(pos.z * 0.15 + time * 3.0) * sin(pos.x * 0.08 + time * 2.2);
              float energy = (wave1 + wave2) * 0.5 + 0.5;

              // Create tunnel-like distortion
              float tunnel = 1.0 - length(vUv - 0.5) * 2.0;
              energy *= tunnel;

              // Dynamic colors
              vec3 color = mix(
                vec3(0.8, 0.1, 1.0),
                vec3(0.1, 0.6, 1.0),
                sin(time + energy * 5.0) * 0.5 + 0.5
              );

              float alpha = energy * 0.3 * tunnel;

              gl_FragColor = vec4(color, alpha);
            }
          `}
          uniforms={{ uTime: { value: 0 } }}
          transparent
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Pulsing energy orbs */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[
          Math.sin(i * 1.256) * 15,
          Math.cos(i * 1.256) * 15,
          -5 + Math.sin(i) * 2
        ]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color={`hsl(${200 + i * 50}, 80%, 60%)`}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </>
  )
}

interface PortalLoadingScreenProps {
  isVisible: boolean
  progress?: number
  status?: string
}

export function PortalLoadingScreen({ isVisible, progress = 0, status = "Generating your film..." }: PortalLoadingScreenProps) {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* 3D Portal Scene */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 12], fov: 75 }}>
          <AdvancedPortalScene />
        </Canvas>
      </div>

      {/* Loading UI Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-md mx-auto px-6"
        >
          {/* Animated Title */}
          <motion.h1
            animate={{
              textShadow: [
                "0 0 10px rgba(147, 51, 234, 0.5)",
                "0 0 30px rgba(147, 51, 234, 1)",
                "0 0 10px rgba(147, 51, 234, 0.5)",
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            ENTERING PORTAL
          </motion.h1>

          {/* Status Text */}
          <motion.p
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            className="text-xl text-purple-300 mb-8"
          >
            {status}
          </motion.p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-3 mb-4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Progress Text */}
          <motion.p
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-gray-400 text-sm"
          >
            {progress}% Complete
          </motion.p>

          {/* Portal Instructions */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mt-12 text-center"
          >
            <p className="text-gray-500 text-sm mb-2">Hold on tight!</p>
            <p className="text-gray-400 text-xs">Your film is being crafted in another dimension</p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
