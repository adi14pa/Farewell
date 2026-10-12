import { askJSON } from "../../llm/groq.js";

/**
 * PLAN step: given the user's constraints, propose 4 realistic candidate
 * destinations worth pricing out. Kept to 4 to bound the number of live
 * SerpApi calls the search node has to make.
 */
export async function plannerNode(state) {
  const { origin, startDate, endDate, budgetInr, vibe } = state;

  const result = await askJSON({
    system:
      "You are a travel planning agent. Given a traveler's origin, dates, " +
      "budget in INR, and desired vibe, propose destination candidates " +
      "reachable by commercial flights that plausibly fit the budget. " +
      'Respond as JSON: {"candidates":[{"city":"","country":"","airportCode":"","why":""}]}. ' +
      "Return exactly 4 candidates, ordered by how well they fit the vibe and budget.",
    user: `Origin: ${origin}\nDates: ${startDate} to ${endDate}\nBudget (INR, total per person): ${budgetInr}\nVibe: ${vibe}`,
  });

  return { candidates: result.candidates || [] };
}
