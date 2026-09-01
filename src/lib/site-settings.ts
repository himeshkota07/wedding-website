import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type HomeHero = {
  bride_name: string;
  groom_name: string;
  wedding_date_label: string;
  /** ISO timestamp (IST) the overall countdown on Home counts down to. Separate from wedding_date_label, which is just display text. */
  wedding_datetime: string;
  location: string;
  welcome_note: string;
  /** Coordinates for the weather widget on the Venue page. */
  weather_lat: number;
  weather_lon: number;
};

export type OurStory = {
  content: string;
};

export type KnowledgeBaseNotes = {
  content: string;
};

const defaultHomeHero: HomeHero = {
  bride_name: "[Bride]",
  groom_name: "[Groom]",
  wedding_date_label: "[Wedding date]",
  wedding_datetime: "",
  location: "[City]",
  welcome_note: "",
  weather_lat: 17.385,
  weather_lon: 78.4867,
};

const defaultOurStory: OurStory = { content: "" };
const defaultKnowledgeBaseNotes: KnowledgeBaseNotes = { content: "" };

export async function getHomeHero(client: SupabaseClient = supabase): Promise<HomeHero> {
  const { data } = await client.from("site_settings").select("value").eq("key", "home_hero").maybeSingle();
  return { ...defaultHomeHero, ...(data?.value as Partial<HomeHero> | undefined) };
}

export async function getOurStory(client: SupabaseClient = supabase): Promise<OurStory> {
  const { data } = await client.from("site_settings").select("value").eq("key", "our_story").maybeSingle();
  return { ...defaultOurStory, ...(data?.value as Partial<OurStory> | undefined) };
}

export async function getKnowledgeBaseNotes(client: SupabaseClient = supabase): Promise<KnowledgeBaseNotes> {
  const { data } = await client.from("site_settings").select("value").eq("key", "knowledge_base_notes").maybeSingle();
  return { ...defaultKnowledgeBaseNotes, ...(data?.value as Partial<KnowledgeBaseNotes> | undefined) };
}
