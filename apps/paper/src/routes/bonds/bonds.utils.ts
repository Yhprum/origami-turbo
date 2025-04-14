import type { bonds } from "@/db/schema";

export function formattedBond(bond: typeof bonds.$inferSelect) {
  const { id, updatedAt, ...rest } = {
    ...bond,
    standardAndPoorRating: {
      value: bond.standardAndPoorRating,
      change: bond.standardAndPoorChange,
    },
    moodyRating: {
      value: bond.moodyRating,
      change: bond.moodyChange,
    },
    fitchRating: {
      value: bond.fitchRating,
      change: bond.fitchChange,
    },
  };
  return rest;
}

// biome-ignore format: 2 columns
export const ratingScale = [
  // S&P, Moody's
  "AAA", "Aaa",
  "AA+", "Aa1",
  "AA", "Aa2",
  "AA-", "Aa3",
  "A+", "A1",
  "A", "A2",
  "A-", "A3",
  "BBB+", "Baa1",
  "BBB", "Baa2",
  "BBB-", "Baa3",
  "BB+", "Ba1",
  "BB", "Ba2",
  "BB-", "Ba3",
  "B+", "B1",
  "B", "B2",
  "B-", "B3",
  "CCC+", "Caa1",
  "CCC", "Caa2",
  "CCC-", "Caa3",
  "CC", "Ca",
  "C", "Ca",
  "D", "C",
  "WR", "NF", "NR", "", null,
];

export function getRatingChange(
  oldRatings: {
    standardAndPoor: { rating: string | null; change: number };
    moody: { rating: string | null; change: number };
    // fitchRating: { rating: string | null; change: number };
  },
  newRatings: {
    standardAndPoorRating: string | null;
    moodyRating: string | null;
    // fitchRating: { rating: string | null; change: number };
  },
  lastRatingChange: number
) {
  const moodysChange =
    ratingScale.indexOf(oldRatings.moody.rating) -
    ratingScale.indexOf(newRatings.moodyRating);
  const spChange =
    ratingScale.indexOf(oldRatings.standardAndPoor.rating) -
    ratingScale.indexOf(newRatings.standardAndPoorRating);
  // const fitchChange =
  //   ratingScale.indexOf(oldRatings.fitchRating.rating) -
  //   ratingScale.indexOf(newRatings.fitchRating.rating);

  const shouldResetChange =
    Date.now() - lastRatingChange > 14 * 24 * 60 * 60 * 1000;
  return {
    standardAndPoor: {
      rating: newRatings.standardAndPoorRating,
      change:
        (shouldResetChange ? 0 : oldRatings.standardAndPoor.change) +
        Math.floor(spChange / 2),
    },
    moody: {
      rating: newRatings.moodyRating,
      change:
        (shouldResetChange ? 0 : oldRatings.moody.change) +
        Math.floor(moodysChange / 2),
    },
    // fitchRating: {
    //   rating: newRatings.fitchRating.rating,
    //   change:
    //     (shouldResetChange ? 0 : oldRatings.fitchRating.change) +
    //     Math.floor(fitchChange / 2),
    // },
  };
}
