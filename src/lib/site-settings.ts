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

// Sample fallbacks taken from the printed engagement invite, shown until the
// admin panel saves real wedding details. No datetime on purpose: the invite's
// date has passed, so no countdown is shown until a real one is set.
const defaultHomeHero: HomeHero = {
  bride_name: "Tarunya",
  groom_name: "Ashish",
  wedding_date_label: "Sunday, 06 September · 10:30 am",
  wedding_datetime: "",
  location: "Sambhrama, Anjanapura Twp, Bangalore",
  welcome_note: "",
  weather_lat: 12.8625,
  weather_lon: 77.5575,
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
