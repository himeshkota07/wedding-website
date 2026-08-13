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
};

export type OurStory = {
  content: string;
};

const defaultHomeHero: HomeHero = {
  bride_name: "[Bride]",
  groom_name: "[Groom]",
  wedding_date_label: "[Wedding date]",
  wedding_datetime: "",
  location: "[City]",
  welcome_note: "",
};

const defaultOurStory: OurStory = { content: "" };

export async function getHomeHero(client: SupabaseClient = supabase): Promise<HomeHero> {
  const { data } = await client.from("site_settings").select("value").eq("key", "home_hero").maybeSingle();
  return { ...defaultHomeHero, ...(data?.value as Partial<HomeHero> | undefined) };
}

export async function getOurStory(client: SupabaseClient = supabase): Promise<OurStory> {
  const { data } = await client.from("site_settings").select("value").eq("key", "our_story").maybeSingle();
  return { ...defaultOurStory, ...(data?.value as Partial<OurStory> | undefined) };
}
