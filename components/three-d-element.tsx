"use client"

import { useRef, useState, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Text } from "@react-three/drei"
import type { Group } from "three"

function Calculator() {
  const group = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      group.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05
    }
  })

  return (
    <group
      ref={group}
      scale={hovered ? 1.05 : 1}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Calculator body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 2.8, 0.3]} />
        <meshStandardMaterial color={hovered ? "#2D3748" : "#1A202C"} metalness={0.1} roughness={0.2} />
      </mesh>

      {/* Calculator screen */}
      <mesh position={[0, 0.8, 0.16]}>
        <boxGeometry args={[1.6, 0.6, 0.05]} />
        <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.1} />
      </mesh>

      {/* Screen display */}
      <mesh position={[0, 0.8, 0.19]}>
        <planeGeometry args={[1.5, 0.5]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.3} />
      </mesh>

      {/* Display text */}
      <Text
        position={[0.6, 0.8, 0.2]}
        fontSize={0.15}
        color="#FFFFFF"
        anchorX="right"
        anchorY="middle"
        font="/fonts/Geist-Bold.ttf"
      >
        ₹1,234.56
      </Text>

      {/* Calculator buttons - Row 1 */}
      <group position={[0, 0.2, 0.16]}>
        {/* Clear button */}
        <mesh position={[-0.6, 0.3, 0]}>
          <boxGeometry args={[0.25, 0.25, 0.08]} />
          <meshStandardMaterial color="#EF4444" metalness={0.2} roughness={0.3} />
        </mesh>
        <Text position={[-0.6, 0.3, 0.05]} fontSize={0.08} color="white" anchorX="center" anchorY="middle">
          C
        </Text>

        {/* Division button */}
        <mesh position={[-0.2, 0.3, 0]}>
          <boxGeometry args={[0.25, 0.25, 0.08]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.2} roughness={0.3} />
        </mesh>
        <Text position={[-0.2, 0.3, 0.05]} fontSize={0.08} color="white" anchorX="center" anchorY="middle">
          ÷
        </Text>

        {/* Multiplication button */}
        <mesh position={[0.2, 0.3, 0]}>
          <boxGeometry args={[0.25, 0.25, 0.08]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.2} roughness={0.3} />
        </mesh>
        <Text position={[0.2, 0.3, 0.05]} fontSize={0.08} color="white" anchorX="center" anchorY="middle">
          ×
        </Text>

        {/* Minus button */}
        <mesh position={[0.6, 0.3, 0]}>
          <boxGeometry args={[0.25, 0.25, 0.08]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.2} roughness={0.3} />
        </mesh>
        <Text position={[0.6, 0.3, 0.05]} fontSize={0.08} color="white" anchorX="center" anchorY="middle">
          -
        </Text>
      </group>

      {/* Calculator buttons - Row 2 */}
      <group position={[0, -0.1, 0.16]}>
        {[7, 8, 9].map((num, index) => (
          <group key={num}>
            <mesh position={[-0.6 + index * 0.4, 0, 0]}>
              <boxGeometry args={[0.25, 0.25, 0.08]} />
              <meshStandardMaterial color="#374151" metalness={0.2} roughness={0.3} />
            </mesh>
            <Text
              position={[-0.6 + index * 0.4, 0, 0.05]}
              fontSize={0.08}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {num}
            </Text>
          </group>
        ))}
        {/* Plus button */}
        <mesh position={[0.6, 0, 0]}>
          <boxGeometry args={[0.25, 0.55, 0.08]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.2} roughness={0.3} />
        </mesh>
        <Text position={[0.6, 0, 0.05]} fontSize={0.08} color="white" anchorX="center" anchorY="middle">
          +
        </Text>
      </group>

      {/* Calculator buttons - Row 3 */}
      <group position={[0, -0.4, 0.16]}>
        {[4, 5, 6].map((num, index) => (
          <group key={num}>
            <mesh position={[-0.6 + index * 0.4, 0, 0]}>
              <boxGeometry args={[0.25, 0.25, 0.08]} />
              <meshStandardMaterial color="#374151" metalness={0.2} roughness={0.3} />
            </mesh>
            <Text
              position={[-0.6 + index * 0.4, 0, 0.05]}
              fontSize={0.08}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {num}
            </Text>
          </group>
        ))}
      </group>

      {/* Calculator buttons - Row 4 */}
      <group position={[0, -0.7, 0.16]}>
        {[1, 2, 3].map((num, index) => (
          <group key={num}>
            <mesh position={[-0.6 + index * 0.4, 0, 0]}>
              <boxGeometry args={[0.25, 0.25, 0.08]} />
              <meshStandardMaterial color="#374151" metalness={0.2} roughness={0.3} />
            </mesh>
            <Text
              position={[-0.6 + index * 0.4, 0, 0.05]}
              fontSize={0.08}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {num}
            </Text>
          </group>
        ))}
        {/* Equals button */}
        <mesh position={[0.6, 0, 0]}>
          <boxGeometry args={[0.25, 0.55, 0.08]} />
          <meshStandardMaterial color="#10B981" metalness={0.2} roughness={0.3} />
        </mesh>
        <Text position={[0.6, 0, 0.05]} fontSize={0.08} color="white" anchorX="center" anchorY="middle">
          =
        </Text>
      </group>

      {/* Calculator buttons - Row 5 (0 and decimal) */}
      <group position={[0, -1, 0.16]}>
        {/* Zero button (wider) */}
        <mesh position={[-0.4, 0, 0]}>
          <boxGeometry args={[0.55, 0.25, 0.08]} />
          <meshStandardMaterial color="#374151" metalness={0.2} roughness={0.3} />
        </mesh>
        <Text position={[-0.4, 0, 0.05]} fontSize={0.08} color="white" anchorX="center" anchorY="middle">
          0
        </Text>

        {/* Decimal button */}
        <mesh position={[0.2, 0, 0]}>
          <boxGeometry args={[0.25, 0.25, 0.08]} />
          <meshStandardMaterial color="#374151" metalness={0.2} roughness={0.3} />
        </mesh>
        <Text position={[0.2, 0, 0.05]} fontSize={0.08} color="white" anchorX="center" anchorY="middle">
          .
        </Text>
      </group>
    </group>
  )
}

// Create a loading fallback component
function LoadingFallback() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#374151" wireframe />
    </mesh>
  )
}

export function ThreeDElement() {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-200 shadow-xl">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.4} />
        <Suspense fallback={<LoadingFallback />}>
          <Calculator />
        </Suspense>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} />
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
