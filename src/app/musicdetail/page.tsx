import { Lyrics } from "@/components/Lyrics";

// export const dynamic = "force-dynamic";

async function fetchSongData(word: string) {
  console.log(`${process.env.NEXT_PUBLIC_BASE_URL}/api/songwords/${word}`);
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/songwords/${word}`);
  if (!res.ok) {
    throw new Error("Failed to fetch song data");
  }
  const data = await res.json();
  return data.songStr;
}

export default async function Video({ searchParams }: { searchParams: Promise<{ audio: string; words: string }> }) {
  const { audio, words } = await searchParams;
  const songStr = await fetchSongData(words);
  console.log(audio, words);
  return (
    <div className="h-screen">
      <Lyrics songStr={songStr} audioName={audio} />
    </div>
  );
}
