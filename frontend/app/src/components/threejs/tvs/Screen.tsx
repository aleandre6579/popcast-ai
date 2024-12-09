import React, { useRef, useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';
import { PlaneGeometry, ShaderMaterial, Vector2 } from 'three';
import { GlitchShader } from './GlitchShader'; // Import the glitch shader
import InformationScreen from './InformationScreen';
import TheAppventurerScreen from './TheAppventurer';

type ScreenProps = {
  position: [number, number, number];
  channelNum: number;
  setChannelNum: (num: number) => void;
};

const channelScreens: Record<number, React.FC> = {
  0: () => <div>Time Estimation Screen</div>,
  1: () => <div>Advertisement Screen</div>,
  2: InformationScreen,
  3: () => <TheAppventurerScreen />,
  4: () => <div>Pollssss Screen</div>,
  5: () => <div>Achievements Screen</div>,
};

export default function Screen({ position, channelNum, setChannelNum }: ScreenProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const glitchMaterial = useRef<ShaderMaterial>(null);

  useEffect(() => {
    if (!isHovered) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = Number(event.key);
      if (key >= 0 && key <= 5 && key !== channelNum) {
        setChannelNum(key)
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), 200)
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isHovered, setChannelNum]);

  useFrame((state) => {
    if (glitchMaterial.current) {
      glitchMaterial.current.uniforms.u_time.value = state.clock.getElapsedTime();
    }
  });

  const ChannelScreen = channelScreens[channelNum];

  return (
    <>
      {/* Glitch Effect */}
      {glitchActive && (
        <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.5, 2]}  />
          <shaderMaterial
            ref={glitchMaterial}
            attach="material"
            args={[GlitchShader]}
            uniforms-u_resolution-value={new Vector2(window.innerWidth, window.innerHeight)}
            transparent
          />
        </mesh>
      )}

      {/* Screen Content */}
      <Html
        position={position}
        transform
        occlude
        rotation={[Math.PI / 2, Math.PI, 0]}
        className="bg-white dark:bg-black w-[137px] h-[80px] rounded-[1px] overflow-hidden"
      >
        <div
          className="p-2 origin-top-left scale-[0.333] w-[414px] h-[240px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {ChannelScreen ? <ChannelScreen /> : <div>No channel selected</div>}
        </div>
      </Html>
    </>
  );
}
