import React from 'react';
import { Html } from '@react-three/drei';

type ScreenUIProps = {
  material: React.ReactNode;
};

export default function ScreenUI(props: ScreenUIProps) {
  return (
    <Html
      style={{ borderRadius: '5px 0px 0px 5px' }}
      className='w-[130px] bg-red-200'
      position={[0, 0.23, 0]}
      material={props.material}
      occlude
    >
      Hello
    </Html>
  );
}
