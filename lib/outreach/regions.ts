/** Match US state filters — handles abbreviations (e.g. IL vs Illinois). */
export function usStateWhere(state?: string) {
  if (!state) return {};
  const normalized = state.trim().toLowerCase();
  if (normalized === "illinois" || normalized === "il") {
    return {
      OR: [
        { stateName: { equals: "IL", mode: "insensitive" as const } },
        { stateName: { contains: "Illinois", mode: "insensitive" as const } },
      ],
    };
  }
  return { stateName: { contains: state, mode: "insensitive" as const } };
}
