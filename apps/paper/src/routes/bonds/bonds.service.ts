import db from "@/db";
import { bonds } from "@/db/schema";
import { REVALIDATE_TIME } from "@/lib/constants";
import { getBonds } from "@/lib/sources/finra";
import { getRatingChange } from "@/routes/bonds/bonds.utils";
import { eq, inArray, sql } from "drizzle-orm";

export async function find(cusip: string) {
  const bond = await db.query.bonds.findFirst({
    where: eq(bonds.cusip, cusip),
  });
  if (!bond) {
    const bonds = await fetchBonds([cusip]);
    return bonds[0];
  }
  return bond;
}

export async function findMany(cusips: string[]) {
  const bondsResult = await db.query.bonds.findMany({
    where: inArray(bonds.cusip, cusips),
  });
  if (bondsResult.length < cusips.length) {
    const newBonds = await fetchBonds(
      cusips.filter(
        (cusip) => !bondsResult.some((bond) => bond.cusip === cusip)
      )
    );
    console.log("newBonds", newBonds);
    bondsResult.push(...newBonds);
  }
  if (
    bondsResult.some((bond) => bond.updatedAt < Date.now() - REVALIDATE_TIME)
  ) {
    const updatedBonds = await revalidate(bondsResult);
    return updatedBonds;
  }
  return bondsResult;
}

async function fetchBonds(cusips: string[]) {
  const bondResponse = await getBonds(cusips);

  if (bondResponse.length === 0) return [];
  try {
    const result = await db.insert(bonds).values(bondResponse).returning();
    console.log("result", result);
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function revalidate(staleBonds: (typeof bonds.$inferSelect)[]) {
  const updatedBonds = await getBonds(staleBonds.map((bond) => bond.cusip));

  const bondUpdates = updatedBonds
    .map((bond) => {
      const staleBond = staleBonds.find((b) => b.figi === bond.figi);
      if (!staleBond) return null;
      const ratingChange = getRatingChange(
        {
          standardAndPoor: {
            rating: staleBond.standardAndPoorRating,
            change: staleBond.standardAndPoorChange,
          },
          moody: {
            rating: staleBond.moodyRating,
            change: staleBond.moodyChange,
          },
        },
        {
          standardAndPoorRating: bond?.standardAndPoorRating,
          moodyRating: bond?.moodyRating,
        },
        staleBond.lastRatingUpdate
      );
      return {
        ...bond,
        standardAndPoorChange: ratingChange.standardAndPoor.change,
        moodyChange: ratingChange.moody.change,
      };
    })
    .filter((bond) => bond !== null);

  const results = await db
    .insert(bonds)
    .values(bondUpdates)
    .onConflictDoUpdate({
      target: [bonds.figi],
      set: {
        price: sql`excluded.price`,
        standardAndPoorRating: sql`excluded.standardAndPoorRating`,
        standardAndPoorChange: sql`excluded.standardAndPoorChange`,
        moodyRating: sql`excluded.moodyRating`,
        moodyChange: sql`excluded.moodyChange`,
      },
    })
    .returning();

  return results;
}
