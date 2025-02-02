export type word = {
  time: number;
  word: string;
};
export class MusicDisplay {
  musicArray: word[];
  constructor(wordStr: string) {
    this.musicArray = this.changeWordsToMusicArray(wordStr);
  }
  private timeStrToNumber(timeStr: string): number {
    const timeParts = timeStr.split(":");
    return Number(timeParts[0]) * 60 + Number(timeParts[1]);
  }

  private changeWordsToMusicArray(wordStr: string): word[] {
    const words: word[] = [];
    const lines = wordStr.split("\n");
    lines.forEach((line) => {
      const [timeStrPart, wordStrPart] = line.split("]");
      const timeStr = timeStrPart.slice(1);
      const time = this.timeStrToNumber(timeStr);
      words.push({ time, word: wordStrPart });
    });
    return words;
  }
}
