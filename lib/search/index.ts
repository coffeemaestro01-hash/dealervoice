import { MeiliSearch } from "meilisearch";

const SEARCH_ENABLED = !!process.env.MEILISEARCH_HOST;

export const searchClient = SEARCH_ENABLED
  ? new MeiliSearch({ host: process.env.MEILISEARCH_HOST!, apiKey: process.env.MEILISEARCH_API_KEY })
  : null;

export const INDEXES = {
  DEALERSHIPS: "dealerships",
  REVIEWS: "reviews",
};

export interface DealerSearchDocument {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  brandNames: string[];
  cityName: string;
  stateName: string;
  countryCode: string;
  countryName: string;
  overallRating: number;
  totalReviews: number;
  reputationScore: number;
  isVerified: boolean;
  isFeatured: boolean;
  latitude: number | null;
  longitude: number | null;
}

export async function indexDealership(doc: DealerSearchDocument) {
  if (!searchClient) return;
  try { await searchClient.index(INDEXES.DEALERSHIPS).addDocuments([doc]); } catch { }
}

export async function removeDealershipFromIndex(id: string) {
  if (!searchClient) return;
  try { await searchClient.index(INDEXES.DEALERSHIPS).deleteDocument(id); } catch { }
}

export async function searchDealerships(params: {
  query?: string;
  country?: string;
  city?: string;
  brand?: string;
  category?: string;
  minRating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const { query = "", page = 1, limit = 20 } = params;

  const filters: string[] = [];
  if (params.country) filters.push(`countryCode = "${params.country.toUpperCase()}"`);
  if (params.city) filters.push(`cityName = "${params.city}"`);
  if (params.brand) filters.push(`brandNames = "${params.brand}"`);
  if (params.category) filters.push(`category = "${params.category}"`);
  if (params.minRating) filters.push(`overallRating >= ${params.minRating}`);

  const sortMap: Record<string, string> = {
    rating: "overallRating:desc",
    reviews: "totalReviews:desc",
    reputation: "reputationScore:desc",
  };

  if (!searchClient) return { hits: [], totalHits: 0, facetDistribution: {} } as any;

  return searchClient.index(INDEXES.DEALERSHIPS).search(query, {
    filter: filters.length ? filters.join(" AND ") : undefined,
    sort: params.sort ? [sortMap[params.sort] ?? "reputationScore:desc"] : ["isFeatured:desc", "reputationScore:desc"],
    offset: (page - 1) * limit,
    limit,
    attributesToHighlight: ["name", "description"],
    facets: ["category", "countryCode", "brandNames"],
  });
}

export async function setupSearchIndexes() {
  if (!searchClient) return;
  const dealerIndex = searchClient.index(INDEXES.DEALERSHIPS);

  await dealerIndex.updateSettings({
    searchableAttributes: ["name", "description", "brandNames", "cityName", "stateName", "countryName"],
    filterableAttributes: ["countryCode", "cityName", "category", "brandNames", "isVerified", "isFeatured", "overallRating"],
    sortableAttributes: ["overallRating", "totalReviews", "reputationScore", "isFeatured"],
    rankingRules: ["words", "typo", "proximity", "attribute", "sort", "exactness"],
  });
}
