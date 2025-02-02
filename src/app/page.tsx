"use client";
import React from "react";
import Link from "next/link";

const SongList = [
  {
    audio: "一生入画.flac",
    words: "一生入画.lrc",
  },
  {
    audio: "英雄寞.mp3",
    words: "英雄寞.lrc",
  },
];
const indexNum = 100;
export default function RootPage() {
  return (
    <div className="relative grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] p-8 gap-8 select-none">
      {SongList.map((song, index) => {
        return (
          <Link
            className="aspect-square bg-white rounded-md overflow-hidden outline-none"
            key={index}
            href={`/musicdetail?audio=${song.audio}&words=${song.words}`}>
            <div className="flex flex-col">
              <div className="bg-emerald-300 py-2 text-center">{song.audio}</div>
              <div className="writing-mode-vertical-lr">{song.words}</div>
            </div>
          </Link>
        );
      })}
      {Array(indexNum)
        .fill(0)
        .map((_, index) => {
          return (
            <div className="aspect-square bg-white rounded-md overflow-hidden select-none" key={index}>
              测试布局
            </div>
          );
        })}
    </div>
  );
}
