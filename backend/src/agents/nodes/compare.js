/**
 * COMPARE step: ranks every priced candidate. In-budget options are ranked
 * cheapest-first; over-budget or unpriced options sink to the bottom so the
 * winner is always the best real, affordable option (or the closest one).
 */
export async function compareNode(state) {
  const { budgetInr, searchResults } = state;

  const ranked = [...searchResults].sort((a, b) => {
    const aOk = a.totalCost != null;
    const bOk = b.totalCost != null;
    if (aOk !== bOk) return aOk ? -1 : 1;
    if (!aOk && !bOk) return 0;

    const aOver = a.totalCost > budgetInr;
    const bOver = b.totalCost > budgetInr;
    if (aOver !== bOver) return aOver ? 1 : -1;

    return a.totalCost - b.totalCost;
  });

  const winner = ranked[0] || null;

  return { ranked, winner };
}
