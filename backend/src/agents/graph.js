import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { plannerNode } from "./nodes/planner.js";
import { flightHotelSearchNode } from "./nodes/search.js";
import { compareNode } from "./nodes/compare.js";
import { itineraryNode } from "./nodes/itinerary.js";


const TripState = Annotation.Root({
  origin: Annotation(),
  startDate: Annotation(),
  endDate: Annotation(),
  budgetInr: Annotation(),
  vibe: Annotation(),

  candidates: Annotation({ default: () => [] }),    
  searchResults: Annotation({ default: () => [] }),   
  ranked: Annotation({ default: () => [] }),           
  winner: Annotation(),                                 
  itinerary: Annotation({ default: () => [] }),        
});

const graph = new StateGraph(TripState)
  .addNode("planner", plannerNode)
  .addNode("search", flightHotelSearchNode)
  .addNode("compare", compareNode)
  .addNode("buildItinerary", itineraryNode)
  .addEdge(START, "planner")
  .addEdge("planner", "search")
  .addEdge("search", "compare")
  .addEdge("compare", "buildItinerary")
  .addEdge("buildItinerary", END);

export const tripGraph = graph.compile();
