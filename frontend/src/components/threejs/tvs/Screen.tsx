import { channels } from '@/pages/Analysis'
import { Html } from '@react-three/drei'
import InformationScreen from './InformationScreen'

type ScreenProps = {
  position: [number, number, number]
  text: string
  channelNum: number
}

export default function Screen({ position, text, channelNum }: ScreenProps) {
  const channel = channels[channelNum]

  return (
    <Html
      position={position}
      transform
      rotation={[Math.PI / 2, Math.PI, 0]}
      className='bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 w-[147px] h-[88px] rounded-[1px] overflow-hidden'
    >
      <div className='p-2 origin-top-left scale-[0.333] w-[441px] h-[264px]'>
        <InformationScreen />
      </div>
    </Html>
  )
}
