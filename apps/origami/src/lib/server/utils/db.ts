export function relationsById<T extends { holdingId: number }>(
  relationItems: T[]
) {
  const relations: Record<string, T[]> = {};
  for (const item of relationItems) {
    if (!relations[item.holdingId]) relations[item.holdingId] = [item];
    else relations[item.holdingId].push(item);
  }

  return relations;
}

// function relation<T extends { holdingId: number }>(holdings: Selectable<Holding>[], relationItems: T[]) {
//   const holdingsById: Record<string, Selectable<Holding> & { transactions: T[] }> = {};
//   // const holdingsById = Object.fromEntries(holdings.map((holding) => [holding.id, { ...holding, a: [] as T[] }]));
//   for (const holding of holdings) {
//     holdingsById[holding.id] = { ...holding, transactions: [] };
//   }

//   for (const item of relationItems) {
//     holdingsById[item.holdingId].transactions.push(item);
//   }

//   return Object.values(holdingsById);
// }
