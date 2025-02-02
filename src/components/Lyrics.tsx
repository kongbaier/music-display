"use client";

import { MusicDisplay } from "@/utils/music";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLyricsControl } from "@/hooks";

export const Lyrics = ({ songStr, audioName }: { songStr: string; audioName: string }) => {
  const musicDisplay = new MusicDisplay(songStr);
  const musicArray = musicDisplay.musicArray;
  const [isShow, setIsShow] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [translateY, setTranslateY] = useState<number>(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLMediaElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ulRef = useRef<HTMLUListElement>(null);
  const liRef = useRef<HTMLLIElement>(null);
  const changeBtnRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContext = canvasRef.current?.getContext("2d");
  const dataArrayRef = useRef(new Uint8Array(0));
  const analyserRef = useRef<AnalyserNode>(null);
  const isInitRef = useRef(false);
  useEffect(() => {
    if (ulRef.current && ulRef.current.children[0]) {
      if (ulRef.current.children[0] instanceof HTMLLIElement) {
        liRef.current = ulRef.current.children[0];
      }
    }
  }, [musicArray]);
  const { active, setActive, findIndex, setUlOffset } = useLyricsControl(musicArray, {
    audioRef: audioRef.current,
    shadeRef: shadeRef.current,
    containerRef: containerRef.current,
    ulRef: ulRef.current,
    liRef: liRef.current,
  });
  const handleClick = (index: number): void => {
    musicArray.forEach((word, i) => {
      console.log(i, word.time, word.word);
    });
    if (audioRef.current) {
      audioRef.current.currentTime = musicArray[index].time;
      setActive(index);
    }
  };
  const handleWhell = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const deltaY = Math.abs(e.deltaY) > 10 ? e.deltaY : 0;
      setIsUserScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      const ulElement = ulRef.current;
      const containerElement = containerRef.current;
      if (!ulElement || !containerElement || !shadeRef.current) return;
      const maxTranslate = -(ulElement.scrollHeight - containerElement.clientHeight + 2 * shadeRef.current.clientHeight);
      const newTranslateY = Math.min(0, Math.max(maxTranslate, translateY - deltaY));
      setTranslateY(newTranslateY);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, 3000);
    },
    [translateY]
  );
  useEffect(() => {
    const audio = audioRef.current;
    const containerElement = containerRef.current;
    //使用被动监听器
    const wheelOptions = {
      passive: false,
      capture: true,
    };
    if (!containerElement || !audio || !musicArray.length) return;
    const handleTimeUpdate = () => {
      const index = findIndex();
      setActive(index);
      if (!isUserScrolling) setUlOffset(index);
    };
    audio.addEventListener("timeupdate", handleTimeUpdate);
    containerElement.addEventListener("wheel", handleWhell, wheelOptions);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      containerElement.removeEventListener("wheel", handleWhell, wheelOptions);
    };
  }, [musicArray, audioRef, handleWhell, isUserScrolling, findIndex, setUlOffset, setActive]);
  const changeCanvas = () => {
    canvasContainerRef.current?.classList.toggle("ml-0");
    setIsShow(!isShow);
  };

  useEffect(() => {
    const initCanvas = () => {
      if (!canvasRef.current || !canvasContainerRef.current) return;
      canvasRef.current.width = canvasContainerRef.current.clientWidth;
      canvasRef.current.height = canvasContainerRef.current.clientHeight;
    };
    initCanvas();
    const audioElement = audioRef.current;
    if (!audioElement) return;
    audioElement.onplay = function () {
      if (isInitRef.current) return;
      const audCtx = new AudioContext();
      const source = audCtx.createMediaElementSource(audioElement);
      analyserRef.current = audCtx.createAnalyser();
      analyserRef.current.fftSize = 512;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      source.connect(analyserRef.current);
      analyserRef.current.connect(audCtx.destination);
      isInitRef.current = true;
    };
    return () => {
      if (audioElement) audioElement.onplay = null;
    };
  }, []);
  const drawToCanvas = useCallback(() => {
    if (typeof window !== "undefined") window.requestAnimationFrame(drawToCanvas);

    if (!canvasRef.current || !analyserRef.current || !canvasContext) return;
    const { width, height } = canvasRef.current;
    const len = dataArrayRef.current.length / 2;
    canvasContext.clearRect(0, 0, width, height);
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const barWidth = height / len;
    canvasContext.fillStyle = "#34d399";
    for (let i = 0; i < len; i++) {
      const data = dataArrayRef.current[i];
      const barHeight = (data / 255) * width;
      const x = 0;
      const y1 = i * barWidth + height / 2;
      const y2 = height / 2 - (i + 1) * barWidth;
      canvasContext.fillRect(x, y1, barHeight, barWidth - 1);
      canvasContext.fillRect(x, y2, barHeight, barWidth - 1);
    }
  }, [canvasContext]);
  useEffect(() => {
    if (!canvasContext) return;
    drawToCanvas();
  }, [canvasContext, drawToCanvas]);
  return (
    <div className="w-full h-full relative flex flex-col">
      <div className="relative h-28 overflow-hidden">
        <Link
          href="/"
          className="fixed ml-8 mt-4 bg-white font-thin text-sm rounded-sm px-2 py-1 hover:bg-emerald-300 hover:text-white focus:outline-none">
          <button className="focus:outline-none">返回</button>
        </Link>
        <audio
          ref={audioRef}
          src={`/audio/${audioName}`}
          controls={true}
          className=" mx-auto my-8 focus:outline-none"></audio>
      </div>
      <div className="relative h-full w-full flex flex-1">
        <div
          className={`absolute bg-white w-6 h-10 top-[50%] rounded-r-md shadow-sm cursor-pointer z-30 transform duration-200 ${
            isShow ? "ml-64" : "ml-0"
          }`}
          onClick={changeCanvas}
          ref={changeBtnRef}>
          <svg
            className={`${isShow ? "rotate-180" : ""} transform duration-200`}
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="40">
            <path
              d="M584.533333 512l-302.933333 302.933333L341.333333 874.666667l302.933334-302.933334 59.733333-59.733333-59.733333-59.733333L341.333333 145.066667 281.6 209.066667l302.933333 302.933333z"
              fill="#34d399"
              p-id="5073"></path>
          </svg>
        </div>
        <div className=" relative w-64 bg-white transform duration-200 -ml-64 rounded-md" ref={canvasContainerRef}>
          <canvas className="w-full h-full" ref={canvasRef}></canvas>
        </div>
        <div className="container relative mx-auto p-4 text-gray-300 text-center h-[600px] flex-1">
          <div
            className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black to-transparent z-10"
            ref={shadeRef}></div>
          <div className="relative h-full overflow-hidden" ref={containerRef}>
            <ul
              className="relative transition-all my-10 duration-700 overflow-hidden ease-in-out"
              ref={ulRef}
              style={{
                transform: `translateY(${translateY}px)`,
                transition: `${isUserScrolling ? "0.3s" : ""}`,
              }}>
              {musicArray.map((word, index) => {
                return (
                  <li
                    key={index}
                    onClick={() => handleClick(index)}
                    className={`flex justify-center mx-auto h-8 max-w-72 text-nowrap cursor-pointer duration-300 transform origin-center ${
                      active == index ? "text-emerald-400 scale-125" : ""
                    }`}>
                    {word.word}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black to-transparent z-10"></div>
        </div>
      </div>
    </div>
  );
};
