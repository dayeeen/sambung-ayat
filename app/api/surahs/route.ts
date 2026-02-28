import { NextRequest, NextResponse } from "next/server";
import { fetchJuz } from "../../../lib/alquran";

// Cache for surahs in each juz
const juzSurahCache = new Map<
  number,
  { id: number; name: string; englishName: string }[]
>();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const juzParam = searchParams.get("juz");

    if (!juzParam) {
      return NextResponse.json(
        { error: "Juz parameter is required" },
        { status: 400 },
      );
    }

    const juzNumbers = Array.from(
      new Set(
        juzParam
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
          .map((v) => Number.parseInt(v, 10)),
      ),
    );

    if (
      juzNumbers.length === 0 ||
      juzNumbers.some((juz) => Number.isNaN(juz) || juz < 1 || juz > 30)
    ) {
      return NextResponse.json(
        { error: "Invalid Juz number" },
        { status: 400 },
      );
    }

    const combinedSurahs = new Map<
      number,
      { id: number; name: string; englishName: string }
    >();

    for (const juz of juzNumbers) {
      let surahsForJuz = juzSurahCache.get(juz);
      if (!surahsForJuz) {
        const ayahs = await fetchJuz(juz);

        const surahMap = new Map<
          number,
          { id: number; name: string; englishName: string }
        >();
        ayahs.forEach((ayah) => {
          if (!surahMap.has(ayah.surah.number)) {
            surahMap.set(ayah.surah.number, {
              id: ayah.surah.number,
              name: ayah.surah.name,
              englishName: ayah.surah.englishName,
            });
          }
        });

        surahsForJuz = Array.from(surahMap.values()).sort(
          (a, b) => a.id - b.id,
        );
        juzSurahCache.set(juz, surahsForJuz);
      }

      surahsForJuz.forEach((surah) => {
        if (!combinedSurahs.has(surah.id)) combinedSurahs.set(surah.id, surah);
      });
    }

    return NextResponse.json(
      Array.from(combinedSurahs.values()).sort((a, b) => a.id - b.id),
    );
  } catch (error) {
    console.error("Surah API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch surahs" },
      { status: 503 },
    );
  }
}
