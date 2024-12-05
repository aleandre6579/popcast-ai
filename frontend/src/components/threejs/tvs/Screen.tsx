import { channels } from '@/pages/Analysis'
import { Html } from '@react-three/drei'
import InformationScreen from './InformationScreen'
import TheAppventurerScreen from './TheAppventurer'

type ScreenProps = {
  position: [number, number, number]
  channelNum: number
}

const channelScreens: Record<number, React.FC> = {
  0: () => <div>Time Estimation Screen</div>,
  1: () => <div>Advertisement Screen</div>,
  2: InformationScreen,
  3: () => <TheAppventurerScreen/>,
  4: () => <div>Pollssss Screen</div>,
  5: () => <div>Achievements Screen</div>,
}

export default function Screen({ position, channelNum }: ScreenProps) {
  const ChannelScreen = channelScreens[channelNum]

  return (
    <Html
      position={position}
      transform
      rotation={[Math.PI / 2, Math.PI, 0]}
      className='bg-white dark:bg-black w-[147px] h-[88px] rounded-[1px] overflow-hidden'
    >
      <div className='p-2 origin-top-left scale-[0.333] w-[441px] h-[264px]'>
        {ChannelScreen ? <ChannelScreen /> : <div>No channel selected</div>}
      </div>
    </Html>
  )
}
