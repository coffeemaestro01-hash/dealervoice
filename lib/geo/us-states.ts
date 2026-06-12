/** US state slug → { code, name } for SEO URL detection and metadata. */
export const US_STATE_BY_SLUG: Record<string, { code: string; name: string }> = {
  alabama: { code: "AL", name: "Alabama" },
  alaska: { code: "AK", name: "Alaska" },
  arizona: { code: "AZ", name: "Arizona" },
  arkansas: { code: "AR", name: "Arkansas" },
  california: { code: "CA", name: "California" },
  colorado: { code: "CO", name: "Colorado" },
  connecticut: { code: "CT", name: "Connecticut" },
  delaware: { code: "DE", name: "Delaware" },
  florida: { code: "FL", name: "Florida" },
  georgia: { code: "GA", name: "Georgia" },
  hawaii: { code: "HI", name: "Hawaii" },
  idaho: { code: "ID", name: "Idaho" },
  illinois: { code: "IL", name: "Illinois" },
  indiana: { code: "IN", name: "Indiana" },
  iowa: { code: "IA", name: "Iowa" },
  kansas: { code: "KS", name: "Kansas" },
  kentucky: { code: "KY", name: "Kentucky" },
  louisiana: { code: "LA", name: "Louisiana" },
  maine: { code: "ME", name: "Maine" },
  maryland: { code: "MD", name: "Maryland" },
  massachusetts: { code: "MA", name: "Massachusetts" },
  michigan: { code: "MI", name: "Michigan" },
  minnesota: { code: "MN", name: "Minnesota" },
  mississippi: { code: "MS", name: "Mississippi" },
  missouri: { code: "MO", name: "Missouri" },
  montana: { code: "MT", name: "Montana" },
  nebraska: { code: "NE", name: "Nebraska" },
  nevada: { code: "NV", name: "Nevada" },
  "new-hampshire": { code: "NH", name: "New Hampshire" },
  "new-jersey": { code: "NJ", name: "New Jersey" },
  "new-mexico": { code: "NM", name: "New Mexico" },
  "new-york": { code: "NY", name: "New York" },
  "north-carolina": { code: "NC", name: "North Carolina" },
  "north-dakota": { code: "ND", name: "North Dakota" },
  ohio: { code: "OH", name: "Ohio" },
  oklahoma: { code: "OK", name: "Oklahoma" },
  oregon: { code: "OR", name: "Oregon" },
  pennsylvania: { code: "PA", name: "Pennsylvania" },
  "rhode-island": { code: "RI", name: "Rhode Island" },
  "south-carolina": { code: "SC", name: "South Carolina" },
  "south-dakota": { code: "SD", name: "South Dakota" },
  tennessee: { code: "TN", name: "Tennessee" },
  texas: { code: "TX", name: "Texas" },
  utah: { code: "UT", name: "Utah" },
  vermont: { code: "VT", name: "Vermont" },
  virginia: { code: "VA", name: "Virginia" },
  washington: { code: "WA", name: "Washington" },
  "west-virginia": { code: "WV", name: "West Virginia" },
  wisconsin: { code: "WI", name: "Wisconsin" },
  wyoming: { code: "WY", name: "Wyoming" },
  "district-of-columbia": { code: "DC", name: "District of Columbia" },
};

export function isUsStateSlug(segment: string): boolean {
  return segment.toLowerCase() in US_STATE_BY_SLUG;
}

/** ISO 3166-1 alpha-2 country codes used in /dealers/{country}. */
export function isCountryCode(segment: string): boolean {
  return /^[a-z]{2}$/i.test(segment);
}
