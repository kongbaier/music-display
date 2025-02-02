import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "song1words.lrc");
    const songStr = await fs.readFile(filePath, "utf-8");
    console.log(songStr);
    return NextResponse.json({ songStr });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
