"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, MeshDistortMaterial } from "@react-three/drei";
import type { Mesh } from "three";
import { useAnimateInView } from "@/hooks/use-animate-in-view";
import { Heading, Text, Caption } from "@/components/ui";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { localize } from "./utils";

function TorusKnot() {
  const meshRef = useRef<Mesh>(null!);
  return (
    <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.2}>
      <mesh ref={meshRef} scale={1.8}>
        <torusKnotGeometry args={[1, 0.4, 128, 16]} />
        <MeshDistortMaterial
          color="#00C2FF"
          roughness={0.15}
          metalness={0.9}
          distort={0.25}
          speed={2}
          emissive="#00C2FF"
          emissiveIntensity={0.15}
        />
      </mesh>
    </Float>
  );
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function Particles() {
  const count = 200;
  const positions = useMemo(() => {
    const rand = seededRandom(42);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (rand() - 0.5) * 12;
    }
    return pos;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#00C2FF" transparent opacity={0.4} />
    </points>
  );
}

type Props = {
  locale: string;
  title?: { en?: string; ar?: string };
  subtitle?: { en?: string; ar?: string };
};

export function ThreeDShowcase({ locale, title, subtitle }: Props) {
  const headingRef = useAnimateInView<HTMLDivElement>();

  return (
    <SectionWrapper className="min-h-[85vh] flex items-center relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-30">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <pointLight position={[-5, -5, -5]} intensity={0.5} color="#00C2FF" />
            <TorusKnot />
            <Particles />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
          </Suspense>
        </Canvas>
      </div>

      <div ref={headingRef} className="relative z-10 text-center max-w-3xl mx-auto">
        <Caption className="mb-4 text-primary tracking-[0.2em]">
          {localize(locale, subtitle) || "Immersive Product Experience"}
        </Caption>
        <Heading as="h2" gradient="white" className="mb-6">
          {localize(locale, title) || "Explore in<br/>Three Dimensions"}
        </Heading>
        <Text size="lg" muted className="max-w-xl mx-auto opacity-70">
          Rotate, zoom, and inspect every detail of our premium collection in photorealistic 3D.
        </Text>
      </div>
    </SectionWrapper>
  );
}
