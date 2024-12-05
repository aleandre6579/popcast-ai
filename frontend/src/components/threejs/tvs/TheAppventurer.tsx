import React from 'react'
import { Youtube } from 'lucide-react'
import { Button } from '@/components/ui/button'

const videos = [
  { title: 'Title', views: '100,000', thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsLbc504oVyiQUG3WdWsBbbJdI2a-t8-OYxA&s' },
  { title: 'Title', views: '100,000', thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsLbc504oVyiQUG3WdWsBbbJdI2a-t8-OYxA&s' },
  { title: 'Title', views: '100,000', thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsLbc504oVyiQUG3WdWsBbbJdI2a-t8-OYxA&s' },
  { title: 'Title', views: '100,000', thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsLbc504oVyiQUG3WdWsBbbJdI2a-t8-OYxA&s' },
]

const TheAppventurerScreen: React.FC = () => {
  return (
    <div className='relative w-full h-full flex flex-col items-center justify-evenly'>
      <a
        className='hover:bg-red-200 p-2 rounded-lg transition flex items-center gap-2'
        href='https://www.youtube.com/@TheAppventurer'
        target='_blank'
        rel='noopener noreferrer'
      >
        <Youtube color='red' size={35} />
        <h1 className='text-2xl font-bold text-center text-red-600'>The Appventurer</h1>
      </a>

      <div className='w-full scrollbar rounded-md flex flex-col items-center'>
        {videos.map((video, index) => (
          <Button asChild variant={'ghost'} key={index}>
            <div className='flex gap-4 cursor-pointer h-[100px] w-full'>
              <img
                src={video.thumbnail}
                alt={video.title}
                className='object-contain h-full rounded-lg'
              />
              <div className='flex flex-col justify-evenly'>
                <h5 className='text-lg'>{video.title}</h5>
                <p>{video.views} views</p>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}

export default TheAppventurerScreen
