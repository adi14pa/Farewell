import { serpSearch } from "../mcpClient.js";

const ORIGIN_AIRPORTS = {
  bhopal: "BHO",
  delhi: "DEL",
  mumbai: "BOM",
  bangalore: "BLR",
  bengaluru: "BLR",
  hyderabad: "HYD",
  chennai: "MAA",
  kolkata: "CCU",
  pune: "PNQ",
};

function guessOriginCode(origin) {
  const key = origin.trim().toLowerCase();
  return ORIGIN_AIRPORTS[key] || "DEL";
}

function cheapestFlightPrice(flightData) {
  const options = [
    ...(flightData?.best_flights || []),
    ...(flightData?.other_flights || []),
  ];
  if (!options.length) return null;
  return Math.min(...options.map((f) => f.price).filter(Boolean));
}

function cheapestHotelPrice(hotelData) {
  const props = hotelData?.properties || [];
  const prices = props
    .map((p) => p.rate_per_night?.extracted_lowest)
    .filter((n) => typeof n === "number");
  if (!prices.length) return null;
  return Math.min(...prices);
}

function topHotels(hotelData, fallbackUrl) {
  const props = hotelData?.properties || [];
  return props.slice(0, 3).map((p) => ({
    name: p.name || "Unnamed stay",
    pricePerNight: p.rate_per_night?.extracted_lowest ?? null,
    rating: p.overall_rating ?? null,
    reviews: p.reviews ?? null,
   
    link: p.link || fallbackUrl,
  }));
}


function googleFlightsUrl({ originCode, destCode, startDate, endDate }) {
  const query = `Flights from ${originCode} to ${destCode} on ${startDate} through ${endDate}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(query)}`;
}


function googleHotelsUrl({ city, startDate, endDate }) {
  const base = `https://www.google.com/travel/hotels/${encodeURIComponent(city)}`;
  const params = new URLSearchParams({ checkin: startDate, checkout: endDate });
  return `${base}?${params.toString()}`;
}


 
export async function flightHotelSearchNode(state) {
  const { origin, startDate, endDate, candidates } = state;
  const originCode = guessOriginCode(origin);
  const nights = Math.max(
    1,
    Math.round((new Date(endDate) - new Date(startDate)) / 86400000)
  );

  const results = await Promise.all(
    candidates.map(async (c) => {
      try {
        const [flights, hotels] = await Promise.all([
          serpSearch({
            engine: "google_flights",
            departure_id: originCode,
            arrival_id: c.airportCode,
            outbound_date: startDate,
            return_date: endDate,
            currency: "INR",
            hl: "en",
          }),
          serpSearch({
            engine: "google_hotels",
            q: `hotels in ${c.city}`,
            check_in_date: startDate,
            check_out_date: endDate,
            currency: "INR",
            hl: "en",
          }),
        ]);

                const flightPricePerPerson = cheapestFlightPrice(flights);
                const hotelPricePerNight = cheapestHotelPrice(hotels);
                const hotelTotal = hotelPricePerNight
                  ? hotelPricePerNight * nights
                  : null;
                const totalCost =
                  flightPricePerPerson != null && hotelTotal != null
                    ? flightPricePerPerson + hotelTotal
                    : null;

                const hotelSearchUrl = googleHotelsUrl({
                  city: c.city,
                  startDate,
                  endDate,
                });

                return {
                  ...c,
                  nights,
                  flightPricePerPerson,
                  hotelPricePerNight,
                  hotelTotal,
                  totalCost,
                  sampleHotel: hotels?.properties?.[0]?.name || null,
                  topHotels: topHotels(hotels, hotelSearchUrl),
                  flightBookingUrl: googleFlightsUrl({
                    originCode,
                    destCode: c.airportCode,
                    startDate,
                    endDate,
                  }),
                  hotelBookingUrl: hotelSearchUrl,
                  searchOk: true,
                };
      } catch (err) {
        return { ...c, searchOk: false, error: err.message, totalCost: null };
      }
    })
  );

  return { searchResults: results };
}
