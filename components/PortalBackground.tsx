'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, Stars, Ring } from '@react-three/drei'
import * as THREE from 'three'

function AdvancedPortalVortex() {
  const groupRef = useRef<THREE.Group>(null!)
  const coreRef = useRef<THREE.Mesh>(null!)
  const outerRingRef = useRef<THREE.Mesh>(null!)
  const innerRingRef = useRef<THREE.Mesh>(null!)

  // Core vortex shader - much more sophisticated
  const coreVertexShader = `
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vDistanceFromCenter;

    void main() {
      vPosition = position;
      vNormal = normal;
      vUv = uv;
      vDistanceFromCenter = length(position.xy);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const coreFragmentShader = `
    uniform float uTime;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vDistanceFromCenter;

    // Advanced noise functions
    vec3 mod289(vec3 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec4 mod289(vec4 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec4 permute(vec4 x) {
      return mod289(((x*34.0)+1.0)*x);
    }

    vec4 taylorInvSqrt(vec4 r) {
      return 1.79284291400159 - 0.85373472095314 * r;
    }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 =   v - i + dot(i, C.xxx) ;

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );

      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;

      i = mod289(i);
      vec4 p = permute( permute( permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );

      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );

      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    float fractalNoise(vec3 p, int octaves) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;

      for(int i = 0; i < 8; i++) {
        if(i >= octaves) break;
        value += amplitude * snoise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
      }

      return value;
    }

    void main() {
      vec3 pos = vPosition * 2.0;

      // Create dynamic swirling portal effect
      float angle = atan(pos.y, pos.x) + uTime * 0.8;
      float radius = length(pos.xy);
      float normalizedRadius = radius / 8.0;

      // Multiple layers of noise for rich texture
      float noise1 = fractalNoise(pos * 1.5 + vec3(0.0, 0.0, uTime * 0.3), 4);
      float noise2 = fractalNoise(pos * 3.0 + vec3(100.0, 50.0, uTime * 0.5), 3);
      float noise3 = fractalNoise(pos * 6.0 + vec3(200.0, 150.0, uTime * 0.7), 2);

      // Create spiral distortion
      float spiral = sin(angle * 4.0 + radius * 3.0 + uTime * 2.0) * 0.3;
      float distortion = noise1 * 0.5 + spiral;

      // Dynamic color palette
      vec3 color1 = vec3(0.8, 0.1, 1.0); // Electric purple
      vec3 color2 = vec3(0.1, 0.4, 1.0); // Bright blue
      vec3 color3 = vec3(1.0, 0.2, 0.8); // Hot pink
      vec3 color4 = vec3(0.2, 1.0, 0.8); // Cyan

      float colorMix1 = sin(uTime * 0.7 + noise1 * 3.0) * 0.5 + 0.5;
      float colorMix2 = cos(uTime * 1.1 + distortion * 2.0) * 0.5 + 0.5;
      float colorMix3 = sin(uTime * 0.9 + noise2 * 4.0) * 0.5 + 0.5;

      vec3 finalColor = mix(color1, color2, colorMix1);
      finalColor = mix(finalColor, color3, colorMix2);
      finalColor = mix(finalColor, color4, colorMix3);

      // Add energy ribbons
      float ribbon1 = sin(angle * 8.0 + uTime * 3.0) * 0.5 + 0.5;
      float ribbon2 = cos(angle * 6.0 + uTime * 2.5) * 0.5 + 0.5;
      finalColor += vec3(ribbon1 * 0.3, ribbon2 * 0.2, (ribbon1 + ribbon2) * 0.1);

      // Depth-based transparency and glow
      float depthFade = 1.0 - abs(vPosition.z) * 0.8;
      float radiusFade = 1.0 - smoothstep(0.0, 8.0, radius);
      float alpha = (depthFade * radiusFade) * (0.8 + noise3 * 0.4);

      // Add bright center glow
      float centerGlow = 1.0 - smoothstep(0.0, 3.0, radius);
      finalColor += centerGlow * vec3(1.0, 0.8, 1.5);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `

  // Ring shader for energy rings
  const ringFragmentShader = `
    uniform float uTime;
    uniform float uRadius;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(vUv, center);

      // Create energy ring effect
      float ringWidth = 0.05;
      float ringGlow = 1.0 - abs(dist - uRadius) / ringWidth;
      ringGlow = max(0.0, ringGlow);

      // Animate the ring
      float pulse = sin(uTime * 4.0) * 0.5 + 0.5;
      ringGlow *= (0.7 + pulse * 0.3);

      // Energy color
      vec3 energyColor = vec3(0.8, 0.3, 1.0);
      energyColor += vec3(0.2, 0.5, 1.0) * sin(uTime * 2.0 + dist * 10.0) * 0.3;

      float alpha = ringGlow * 0.8;

      gl_FragColor = vec4(energyColor, alpha);
    }
  `

  const coreUniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), [])

  const ringUniforms1 = useMemo(() => ({
    uTime: { value: 0 },
    uRadius: { value: 0.3 }
  }), [])

  const ringUniforms2 = useMemo(() => ({
    uTime: { value: 0 },
    uRadius: { value: 0.6 }
  }), [])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (groupRef.current) {
      // Complex rotation pattern
      groupRef.current.rotation.z = time * 0.2
      groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.1
      groupRef.current.rotation.y = Math.cos(time * 0.4) * 0.1
    }

    // Update shader uniforms
    if (coreRef.current && coreRef.current.material) {
      (coreRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time
    }

    if (outerRingRef.current && outerRingRef.current.material) {
      (outerRingRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time
    }

    if (innerRingRef.current && innerRingRef.current.material) {
      (innerRingRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time
    }
  })

  return (
    <group ref={groupRef}>
      {/* Core Vortex */}
      <Sphere ref={coreRef} args={[12, 128, 128]} position={[0, 0, -2]}>
        <shaderMaterial
          vertexShader={coreVertexShader}
          fragmentShader={coreFragmentShader}
          uniforms={coreUniforms}
          transparent
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* Energy Rings */}
      <Ring ref={innerRingRef} args={[8, 8.5, 128]} rotation={[Math.PI / 2, 0, 0]}>
        <shaderMaterial
          vertexShader={`
            varying vec2 vUv;
            varying vec3 vPosition;
            void main() {
              vUv = uv;
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={ringFragmentShader}
          uniforms={ringUniforms1}
          transparent
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </Ring>

      <Ring ref={outerRingRef} args={[14, 14.5, 128]} rotation={[Math.PI / 2, 0, 0]}>
        <shaderMaterial
          vertexShader={`
            varying vec2 vUv;
            varying vec3 vPosition;
            void main() {
              vUv = uv;
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={ringFragmentShader}
          uniforms={ringUniforms2}
          transparent
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </Ring>
    </group>
  )
}

function PortalParticles() {
  const particlesRef = useRef<THREE.Points>(null!)
  const velocitiesRef = useRef<Float32Array>(null!)

  const particleCount = 1500
  const maxDistance = 25 // Maximum distance from center

  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3

      // Create particles at random positions around the perimeter
      const angle = Math.random() * Math.PI * 2
      const radius = maxDistance + Math.random() * 10 // Start outside the visible area

      positions[i3] = Math.cos(angle) * radius
      positions[i3 + 1] = Math.sin(angle) * radius
      positions[i3 + 2] = (Math.random() - 0.5) * 15 // Some depth variation
    }

    return positions
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const velocities = useMemo(() => {
    velocitiesRef.current = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3

      // Give each particle a slight random velocity toward center
      const angle = Math.random() * Math.PI * 2
      velocitiesRef.current[i3] = Math.cos(angle) * 0.01 // Small random x velocity
      velocitiesRef.current[i3 + 1] = Math.sin(angle) * 0.01 // Small random y velocity
      velocitiesRef.current[i3 + 2] = (Math.random() - 0.5) * 0.005 // Small z drift
    }

    return velocitiesRef.current
  }, [])

  useFrame(() => {
    if (particlesRef.current && velocitiesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3

        const x = positions[i3]
        const y = positions[i3 + 1]

        const distanceFromCenter = Math.sqrt(x * x + y * y)

        // Strong gravitational pull toward center (much stronger when closer)
        const gravityStrength = Math.max(0.01, (maxDistance - distanceFromCenter) / maxDistance) * 0.08
        const pullX = -x / distanceFromCenter * gravityStrength
        const pullY = -y / distanceFromCenter * gravityStrength

        // Very subtle spiral motion (much weaker)
        const spiralStrength = 0.001
        const spiralX = -y / distanceFromCenter * spiralStrength
        const spiralY = x / distanceFromCenter * spiralStrength

        // Update velocities with strong gravity + subtle spiral
        velocitiesRef.current[i3] += pullX + spiralX
        velocitiesRef.current[i3 + 1] += pullY + spiralY

        // Apply damping to prevent particles from moving too fast
        velocitiesRef.current[i3] *= 0.98
        velocitiesRef.current[i3 + 1] *= 0.98
        velocitiesRef.current[i3 + 2] *= 0.99

        // Update positions
        positions[i3] += velocitiesRef.current[i3]
        positions[i3 + 1] += velocitiesRef.current[i3 + 1]
        positions[i3 + 2] += velocitiesRef.current[i3 + 2]

        // If particle gets too close to center, reset it to the perimeter
        if (distanceFromCenter < 0.3) {
          const resetAngle = Math.random() * Math.PI * 2
          const resetRadius = maxDistance + Math.random() * 15

          positions[i3] = Math.cos(resetAngle) * resetRadius
          positions[i3 + 1] = Math.sin(resetAngle) * resetRadius
          positions[i3 + 2] = (Math.random() - 0.5) * 15

          // Reset velocity with some inward bias
          const inwardAngle = Math.atan2(-positions[i3 + 1], -positions[i3]) + (Math.random() - 0.5) * 0.5
          const speed = 0.005 + Math.random() * 0.01
          velocitiesRef.current[i3] = Math.cos(inwardAngle) * speed
          velocitiesRef.current[i3 + 1] = Math.sin(inwardAngle) * speed
          velocitiesRef.current[i3 + 2] = (Math.random() - 0.5) * 0.002
        }

        // If particle gets too far, also reset it
        if (distanceFromCenter > maxDistance * 1.5) {
          const resetAngle = Math.random() * Math.PI * 2
          const resetRadius = maxDistance + Math.random() * 10

          positions[i3] = Math.cos(resetAngle) * resetRadius
          positions[i3 + 1] = Math.sin(resetAngle) * resetRadius
          positions[i3 + 2] = (Math.random() - 0.5) * 15

          velocitiesRef.current[i3] = 0
          velocitiesRef.current[i3 + 1] = 0
          velocitiesRef.current[i3 + 2] = 0
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
        size={0.08}
        color="#ffffff"
        transparent
        opacity={0.7}
        sizeAttenuation={true}
        vertexColors={false}
      />
    </points>
  )
}

export function PortalBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 25], fov: 75 }}
        style={{ background: 'radial-gradient(ellipse at center, #000022 0%, #000011 50%, #000008 100%)' }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 15]} intensity={0.8} color="#8b5cf6" />
        <pointLight position={[10, 10, 10]} intensity={0.4} color="#3b82f6" />
        <pointLight position={[-10, -10, 10]} intensity={0.4} color="#ec4899" />

        <AdvancedPortalVortex />
        <PortalParticles />
        <Stars radius={200} depth={100} count={8000} factor={6} saturation={0} fade speed={0.2} />
      </Canvas>
    </div>
  )
}
