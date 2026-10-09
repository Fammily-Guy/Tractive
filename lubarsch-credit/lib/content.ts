import marketsData from "@/content/markets.json";
import storiesData from "@/content/stories.json";
import teamData from "@/content/team.json";
import impactData from "@/content/impact.json";
import lgaData from "@/content/lgas.json";

export interface Market { id: string; name: string; area: string; visitDays: string[] }
export interface Story {
  id: string; name: string; trade: string; market: string; usedFor: string; quote: string;
  image: string; imageAlt: string; consent: boolean; placeholder?: boolean;
}

export const markets: Market[] = marketsData.markets;
export const lgas: string[] = lgaData.lgas;
export const team = teamData.team;
export const impact = impactData as { customers: number | null; disbursed: number | null; markets: number | null; repaymentRate: number | null };

/** Stories without explicit consent never render. */
export const stories: Story[] = (storiesData.stories as Story[]).filter((s) => s.consent === true);
