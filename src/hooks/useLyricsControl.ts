import { word } from "@/utils/music";
import { useCallback, useState } from "react";

export interface useLyricsControlOptions {
  /**音频元素 */
  audioRef: HTMLAudioElement | null;
  /**歌词遮罩元素 */
  shadeRef: HTMLDivElement | null;
  /**歌词容器元素 */
  containerRef: HTMLDivElement | null;
  /**歌词ul元素 */
  ulRef: HTMLUListElement | null;
  /**歌词li元素 */
  liRef: HTMLLIElement | null;
}
export interface useLyricsControlReturn {
  /** 当前高亮的歌词索引 */
  active: number;
  /** 设置高亮歌词索引 */
  setActive: (value: number) => void;
  /** 根据当前时间查找对应歌词索引 */
  findIndex: () => number;
  /** 计算并设置歌词滚动位置 */
  setUlOffset: (index: number) => void;
}
/**
 * 歌词控制 Hook
 * @param {word[]} musicArray - 歌词数组
 * @param {useLyricsControlOptions} options - Hook 配置项
 * @returns {useLyricsControlReturn} 返回的方法和状态：
 * - `active` 当前高亮的歌词索引
 * - `setActive` 设置高亮歌词索引
 * - `findIndex` 根据当前时间查找对应歌词索引
 * - `setUlOffset` 计算并设置歌词滚动位置
 */
export const useLyricsControl = (
  musicArray: word[],
  { audioRef, shadeRef, containerRef, ulRef, liRef }: useLyricsControlOptions
): useLyricsControlReturn => {
  const [active, setActive] = useState<number>(0);

  const findIndex = useCallback(() => {
    const curTime = audioRef?.currentTime;
    const index = musicArray.findIndex((music) => curTime && music.time > curTime);
    if (curTime === 0) return 0;
    if (index === -1) return musicArray.length - 1;
    return index - 1;
  }, [musicArray, audioRef]);

  const setUlOffset = useCallback(
    (index: number) => {
      const containerHeight = containerRef?.clientHeight;
      const ulHeight = ulRef?.clientHeight;
      const liHeight = liRef?.clientHeight;
      const shadeHeight = shadeRef?.clientHeight;
      if (!containerHeight || !ulHeight || !liHeight || !shadeHeight) return;
      const offset = Math.max(0, liHeight * index + liHeight / 2 - containerHeight / 2 + shadeHeight);
      if (ulRef) {
        ulRef.style.transform =
          offset < 0
            ? `translateY(0px)`
            : offset > ulHeight - containerHeight
            ? `translateY(-${ulHeight - containerHeight + 2 * shadeHeight}px)`
            : `translateY(-${offset}px)`;
      }
    },
    [liRef, ulRef, containerRef, shadeRef]
  );

  return { active, setActive, findIndex, setUlOffset };
};
