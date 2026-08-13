import { supabase } from "@/lib/supabase";

export type HomeHero = {
  bride_name: string;
  groom_name: string;
  wedding_date_label: string;
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
  location: "[City]",
  welcome_note: "",
};

const defaultOurStory: OurStory = { content: "" };

export async function getHomeHero(): Promise<HomeHero> {
  const { data } = await supabase.from("site_settings").select("value").eq("key", "home_hero").maybeSingle();
  return { ...defaultHomeHero, ...(data?.value as Partial<HomeHero> | undefined) };
}

export async function getOurStory(): Promise<OurStory> {
  const { data } = await supabase.from("site_settings").select("value").eq("key", "our_story").maybeSingle();
  return { ...defaultOurStory, ...(data?.value as Partial<OurStory> | undefined) };
}
