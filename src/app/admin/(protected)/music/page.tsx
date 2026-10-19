import SubmitButton from "@/components/admin/SubmitButton";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { getMusic, type Song } from "@/lib/music";
import SongUpload from "./SongUpload";
import { removeSong } from "./actions";

const card = "rounded-lg border border-black/10 bg-white p-4 shadow-sm";

function SongSlot({
  slot,
  title,
  hint,
  song,
  fallback,
}: {
  slot: string;
  title: string;
  hint: string;
  song: Song | null;
  fallback: string;
}) {
  return (
    <div className={`${card} space-y-3`}>
      <div>
        <h3 className="font-semibold text-zinc-900">{title}</h3>
        <p className="text-sm text-zinc-500">{hint}</p>
      </div>
      {song ? (
        <>
          <p className="text-sm text-zinc-800">
            Now playing: <span className="font-medium">{song.name}</span>
          </p>
          <audio controls preload="none" src={song.url} className="w-full" />
        </>
      ) : (
        <p className="text-sm text-zinc-500">No song set. {fallback}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <SongUpload slot={slot} hasSong={Boolean(song)} />
        {song && (
          <form action={removeSong}>
            <input type="hidden" name="slot" value={slot} />
            <SubmitButton
              pendingLabel="Removing…"
              doneLabel="Removed"
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600"
            >
              Remove
            </SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}

export default async function AdminMusicPage() {
  const [music, { data: events }] = await Promise.all([
    getMusic(),
    createAdminSupabase().from("events").select("id, name").order("sort_order", { ascending: true }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Music</h1>
      <p className="mt-1 text-zinc-600">
        Guests turn the music on with the button in the corner. After that, the song changes as they scroll: the
        background song plays throughout, the events song takes over in the Events section, and on phones each event
        can have its own song while its card is on screen. Songs fade into each other. MP3 files up to 20 MB work best.
      </p>

      <div className="mt-6 space-y-4">
        <SongSlot
          slot="master"
          title="Background song"
          hint="Plays across the whole site, outside the Events section."
          song={music.master}
          fallback="The site's built-in song plays."
        />
        <SongSlot
          slot="events_section"
          title="Events section song"
          hint="Plays while the Events section is on screen. On phones, an event's own song takes over on its card."
          song={music.events_section}
          fallback="The background song keeps playing."
        />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">A song for each event (phones)</h2>
      <p className="mt-1 text-sm text-zinc-600">
        On phones, events are shown one under another, so each can have its own song. On computers and tablets the
        Events section song plays instead.
      </p>
      <div className="mt-3 space-y-4">
        {(events ?? []).map((event) => (
          <SongSlot
            key={event.id}
            slot={`event:${event.id}`}
            title={event.name}
            hint="Plays on phones while this event's card is in the middle of the screen."
            song={music.events[event.id] ?? null}
            fallback="The Events section song plays."
          />
        ))}
        {!events?.length && <p className="text-sm text-zinc-500">No events yet.</p>}
      </div>
    </div>
  );
}
