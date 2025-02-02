import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ songWordName: string }> }
) {
  const { songWordName } = await params;
  try {
    const filePath = path.join(process.cwd(), "public/songword", songWordName);
    const songStr = await fs.readFile(filePath, "utf-8");
    console.log(songStr);
    return NextResponse.json({ songStr });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
