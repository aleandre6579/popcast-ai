import React, { useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import gsap from 'gsap';

type Supporter = {
  name: string;
};

const Support: React.FC = () => {
  //GSAP animations on render
  useEffect(() => {
    const onRenderTimeline = gsap.timeline()
    onRenderTimeline.fromTo(
      '.supportCard',
      { scale: 0.1, y: '+=60', ease: 'power1.inOut', opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 1, stagger: 0.1},
    ).fromTo(
      '.supportersCard',
      { scale: 0.1, y: '+=60', ease: 'power1.inOut', opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 1},
      0.5
    ).fromTo(
      '.supporter',
      { opacity: 0, y: '+=30', scale: 2, ease: 'power1.inOut' },
      { opacity: 1, y: 0, duration: 1, scale: 1, stagger: 0.1},
      1,
    )
  }, [])

  const listRef = useRef<HTMLDivElement>(null);
  const scrollTimelineRef = useRef<GSAPTimeline | null>(null);

  const supporters: Supporter[] = [{name: 'Alex'}, {name: 'Alex'}, {name: 'Alex'}, {name: 'Alex'}];

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (scrollTimelineRef.current) return;

    let isScrollingDown = true;
    const maxScroll = list.scrollHeight - list.clientHeight;

    const animateScroll = () => {
      scrollTimelineRef.current = gsap.timeline({ repeat: -1, repeatDelay: 2 });
      const scrollDuration = (maxScroll - list.scrollTop) / 30;
      scrollTimelineRef.current?.to(list, {
        scrollTop: maxScroll,
        duration: scrollDuration,
        ease: 'linear',
      });
      scrollTimelineRef.current?.to(
        list,
        {
          scrollTop: 0,
          duration: scrollDuration,
          ease: 'linear',
        },
        '>1',
      );
    };

    const handleMouseEnter = () => {
      if (scrollTimelineRef.current) {
        scrollTimelineRef.current.pause();
        isScrollingDown = scrollTimelineRef.current.progress() < 0.5;
      }
    };

    const handleMouseLeave = () => {
      if (scrollTimelineRef.current) {
        const progress = isScrollingDown
          ? list.scrollTop / maxScroll / 2
          : (maxScroll - list.scrollTop) / maxScroll / 2 + 0.5;
        console.log(progress);
        scrollTimelineRef.current.progress(progress);
        scrollTimelineRef.current.resume();
      }
    };

    list.addEventListener('mouseenter', handleMouseEnter);
    list.addEventListener('mouseleave', handleMouseLeave);

    animateScroll();

    return () => {
      if (list) {
        list.removeEventListener('mouseenter', handleMouseEnter);
        list.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (scrollTimelineRef.current) {
        scrollTimelineRef.current.kill();
      }
    };
  }, []);

  return (
    <div className='p-4 flex flex-col h-full'>
      {/* Header */}
      <h1 className='flex-none text-4xl font-extrabold text-center mt-8 tracking-tight'>
        Thank you for using PopcastAI!
      </h1>
      <p className='flex-none text-sm text-center mt-2'>
        Your support allows me to work on my apps fulltime and build more
        products that I love.
      </p>

      {/* Layout */}
      <div className='h-full p-12 flex flex-col lg:flex-row justify-between gap-6 mt-8'>
        {/* Main Cards Section */}
        <div className='grid grid-cols-2 gap-4 flex-1'>
          <SupportCard title='Check out my YouTube channel' />
          <SupportCard title='Buy me a Coffee' />
          <SupportCard title='Check out my other products' />
          <SupportCard title='My Socials' />
        </div>

        {/* Supporters Section */}
        <Card className='supportersCard w-full lg:w-1/4 shadow-md text-center overflow-hidden'>
          <CardHeader>
            <CardTitle className='text-lg font-semibold'>Supporters</CardTitle>
          </CardHeader>
          <CardContent className='relative'>
            {supporters.length ? (
              <div
                ref={listRef}
                className='w-full h-40 overflow-auto relative scrollbar overflow-x-hidden'
              >
                <ul className='text-sm space-y-2'>
                  {supporters.map((supporter, index) => (
                    <li className='supporter' key={index + supporter.name}>{supporter.name}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <p>Be my first supporter!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SupportCard: React.FC<{ title: string }> = ({ title }) => {
  return (
    <Card className='supportCard p-6 rounded-lg shadow-md flex items-center justify-center'>
      <CardContent>
        <h2 className='text-sm font-medium'>{title}</h2>
      </CardContent>
    </Card>
  );
};

export default Support;
