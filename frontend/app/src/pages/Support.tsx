import React, { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import gsap from "gsap";

const Support: React.FC = () => {
  const listRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimelineRef = useRef<GSAPTimeline | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isScrollDown, setIsScrollDown] = useState(true)

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const maxScroll = list.scrollHeight - list.clientHeight;
    console.log( maxScroll - list.scrollTop / 188);
    

    const animateScroll = () => {
      const animateDown = () => {
        scrollTimelineRef.current?.to(list, {
          scrollTop: maxScroll,
          duration: (maxScroll - list.scrollTop) / 15,
          ease: "linear",
        });
      }
      const animateUp = () => {
        scrollTimelineRef.current?.to(list, {
          scrollTop: 0,
          duration: list.scrollTop / 20,
          ease: "linear",
        });
      }

      // Don't auto-scroll if user is scrolling or GSAP timeline already exists
      if (isUserScrolling || scrollTimelineRef.current) return;

      scrollTimelineRef.current = gsap.timeline({ repeat: -1, repeatDelay: 2 });
      if(isScrollDown) {
        animateDown();
        animateUp();
      } else {
        animateUp();
        animateDown();
      }
    };


    // Function to handle mouse enter event
    const handleMouseEnter = () => {
      // Stop the animation when the cursor enters the scrollable area
      if (scrollTimelineRef.current) {
        scrollTimelineRef.current.kill(); // Pause animation
        scrollTimelineRef.current = null
      }
    };

    // Function to handle mouse leave event
    const handleMouseLeave = () => {
      // Resume the animation when the cursor leaves the scrollable area
      animateScroll();
    };

    // Add mouse enter and leave listeners to detect cursor hover
    list.addEventListener("mouseenter", handleMouseEnter);
    list.addEventListener("mouseleave", handleMouseLeave);

    animateScroll();

    // Cleanup event listeners on component unmount
    return () => {
      if (list) {
        list.removeEventListener("mouseenter", handleMouseEnter);
        list.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (scrollTimelineRef.current) {
        scrollTimelineRef.current.kill(); // Cleanup the GSAP timeline on unmount
      }
    };
  }, [isUserScrolling]);

  return (
    <div className="p-4">
      {/* Header */}
      <h1 className="text-4xl font-extrabold text-center mt-8 tracking-tight">
        Thank you for using PopcastAI!
      </h1>
      <p className="text-sm text-center mt-2">
        Your support allows me to work on my apps fulltime and build more products that I love.
      </p>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 mt-8">
        {/* Main Cards Section */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          <SupportCard title="Check out my YouTube channel" />
          <SupportCard title="Buy me a Coffee" />
          <SupportCard title="Check out my other products" />
          <SupportCard title="My Socials" />
        </div>

        {/* Supporters Section */}
        <Card className="w-full lg:w-1/4 shadow-md text-center overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Supporters</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {/* Plain Scrollable Container */}
            <div
              ref={listRef}
              className="w-full h-40 overflow-auto relative scrollbar"
            >
              <ul className="text-sm space-y-2">
                <li>Alexandre Simon</li>
                <li>Daniel Cruise</li>
                <li>Mamouchka Simon</li>
                <li>Alexandra Rodriguez</li>
                <li>Supporter 1</li>
                <li>Supporter 2</li>
                <li>Supporter 3</li>
                <li>Supporter 4</li>
                <li>Supporter 5</li>
                <li>Supporter 6</li>
                <li>Supporter 7</li>
                <li>Supporter 8</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SupportCard: React.FC<{ title: string }> = ({ title }) => {
  return (
    <Card className="p-6 rounded-lg shadow-md flex items-center justify-center">
      <CardContent>
        <h2 className="text-sm font-medium">{title}</h2>
      </CardContent>
    </Card>
  );
};

export default Support;
