import { serpSearch } from "../mcpClient.js";
import { askJSON } from "../../llm/groq.js";

/**
 * ACT step: for the winning destination, pulls live local attractions from
 * SerpApi (google_local) and has the LLM sequence them into a day-by-day
 * plan that respects the trip length.
 */
export async function itineraryNode(state) {
  const { winner, startDate, endDate, vibe } = state;
  if (!winner) return { itinerary: null };

  let places = [];
  try {
    const local = await serpSearch({
      engine: "google_local",
      q: `top attractions in ${winner.city}`,
      hl: "en",
    });
    places = (local?.local_results || [])
      .slice(0, 12)
      .map((p) => ({ name: p.title, rating: p.rating, type: p.type }));
  } catch {
    places = [];
  }

  const nights = winner.nights || 1;

  const plan = await askJSON({
    system:
      "You are a travel itinerary agent. Build a realistic day-by-day plan " +
      "using ONLY the given list of real places where possible, grouped " +
      "sensibly by area/time of day. " +
      'Respond as JSON: {"days":[{"day":1,"label":"","stops":[{"time":"","name":"","note":""}]}]}.',
    user:
      `Destination: ${winner.city}, ${winner.country}\n` +
      `Trip length: ${nights} night(s), ${startDate} to ${endDate}\n` +
      `Traveler vibe: ${vibe}\n` +
      `Known real places (use these names when relevant): ${JSON.stringify(places)}`,
  });

  return { itinerary: plan.days || [] };
}
