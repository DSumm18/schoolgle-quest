// App configuration
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  },
  api: {
    postcodesBaseUrl: process.env.POSTCODES_API_BASE_URL || "https://api.postcodes.io",
    schoolsBaseUrl: process.env.SCHOOLS_API_BASE_URL || "",
    placesBaseUrl: process.env.PLACES_API_BASE_URL || ""
  }
} as const;
