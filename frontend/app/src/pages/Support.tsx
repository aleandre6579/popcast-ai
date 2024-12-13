import React, { useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import gsap from 'gsap';

type Supporter = {
  name: string;
};

const Support: React.FC = () => {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollTimelineRef = useRef<GSAPTimeline | null>(null);

  //GSAP animations on render
  useEffect(() => {
    const onRenderTimeline = gsap.timeline();
    onRenderTimeline
      .fromTo(
        '.title',
        { y: '-=50', opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
      )
      .fromTo(
        '.subtitle',
        { y: '-=50', opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        0.3,
      )
      .fromTo(
        '.supportCard',
        { scale: 0, y: '+=100', opacity: 0, ease: 'power1.inOut' },
        { scale: 1, y: 0, opacity: 1, duration: 0.8, stagger: 0.1 },
        0.5,
      )
      .fromTo(
        '.supportersCard',
        { scale: 0.1, y: '+=60', opacity: 0, ease: 'power1.inOut' },
        { scale: 1, y: 0, opacity: 1, delay: -0.6, duration: 0.8 },
      )
      .fromTo(
        '.supporter',
        { opacity: 0, y: '+=30', scale: 2, ease: 'power1.inOut' },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: -0.3,
          stagger: 0.1,
          onComplete: () => {
            if (
              listRef.current &&
              listRef.current?.scrollHeight > listRef.current?.offsetHeight
            ) {
              console.log('ASDASD');

              listRef.current?.classList.remove('overflow-y-hidden');
              listRef.current?.classList.add('post-scrollbar-animation');
            }
          },
        },
      );
  }, []);

  const supporters: Supporter[] = [
    { name: 'Alex' },
    { name: 'Alex' },
    { name: 'Alex' },
    { name: 'Alex' },
    { name: 'Alex' },
    { name: 'Alex' },
    { name: 'Alex' },
    { name: 'Alex' },
    { name: 'Alex' },
    { name: 'Alex' },
    { name: 'Alex' },
  ];

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
    <div className='h-full flex flex-col'>
      {/* Header */}
      <h1 className='title flex-none text-xl md:text-4xl font-extrabold text-center mt-8 tracking-tight'>
        Thank you for using PopcastAI!
      </h1>
      <p className='subtitle flex-none text-xs md:text-sm text-center mt-2'>
        Your support allows me to work on my apps fulltime and build more
        awesome products.
      </p>

      {/* Layout */}
      <div className='p-8 md:px-32 md:py-16 flex flex-col lg:flex-row justify-between gap-8 mt-8'>
        {/* Main Cards Section */}
        <div className='grid grid-cols-2 grow gap-4 flex-1'>
          <SupportCard
            link='https://www.youtube.com/@TheAppventurer'
            title='Check out my YouTube channel'
          />
          <SupportCard
            link='https://www.buymeacoffee.com/theappventurer'
            title='Buy me a Coffee'
          />
          <SupportCard title='Check out my other products' />
          <SupportCard title='My Socials' />
        </div>

        {/* Supporters Section */}
        <Card className='supportersCard shrink lg:w-1/4 h-1/3 shadow-md text-center overflow-hidden'>
          <CardHeader className='pt-6 pb-2'>
            <CardTitle className='text-lg font-semibold'>Supporters</CardTitle>
          </CardHeader>
          <CardContent className='relative'>
            {supporters.length ? (
              <div
                ref={listRef}
                className='scrollbar w-full relative overflow-x-hidden overflow-y-hidden'
              >
                <ul className='text-sm space-y-2'>
                  {supporters.map((supporter, index) => (
                    <li className='supporter' key={index + supporter.name}>
                      {supporter.name}
                    </li>
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

const SupportCard: React.FC<{ title: string; link?: string }> = ({
  title,
  link,
}) => {
  return (
    <a href={link} target='_blank' rel='noreferrer'>
      <Card className='supportCard grow h-full border-2 border-transparent hover:dark:border-white hover:border-black hover:shadow-inner rounded-lg shadow-md'>
        <CardContent>
          <h2 className='text-sm font-medium'>{title}</h2>
        </CardContent>
      </Card>
    </a>
  );
};

export default Support;
