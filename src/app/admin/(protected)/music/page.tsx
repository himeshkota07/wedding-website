import SubmitButton from "@/components/admin/SubmitButton";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { getMusic, type Song } from "@/lib/music";
import SongUpload from "./SongUpload";
import { removeSong, setMusicMode } from "./actions";

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
  const single = music.mode === "single";

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Music</h1>
      <p className="mt-1 text-zinc-600">
        The music is on by default and starts as soon as guests open their link. Songs fade into each other. MP3 or
        M4A files up to 20 MB work best.
      </p>

      <form action={setMusicMode} className={`${card} mt-6 space-y-3`}>
        <h2 className="font-semibold text-zinc-900">Music mode</h2>
        <label className="flex items-start gap-2 text-sm">
          <input type="radio" name="mode" value="single" defaultChecked={single} className="mt-1" />
          <span>
            <span className="font-medium text-zinc-900">One song for the whole site</span>
            <span className="block text-zinc-500">Upload a single song. It plays from the moment the link opens to the end.</span>
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="radio" name="mode" value="sections" defaultChecked={!single} className="mt-1" />
          <span>
            <span className="font-medium text-zinc-900">A song for each part</span>
            <span className="block text-zinc-500">
              An opening song down to the first event, then each event&apos;s own song on phones, with the last
              event&apos;s song carrying on to the end.
            </span>
          </span>
        </label>
        <SubmitButton>Save mode</SubmitButton>
        <p className="text-xs text-zinc-500">Switching keeps the other mode&apos;s songs saved, ready for switching back.</p>
      </form>

      {single ? (
        <div className="mt-6 space-y-4">
          <SongSlot
            slot="master"
            title="Song for the whole site"
            hint="Plays from the moment the link opens, through the opening, to the end of the page."
            song={music.master}
            fallback="The site's built-in song plays."
          />
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-4">
            <SongSlot
              slot="opening"
              title="Opening song"
              hint="Starts as soon as the link opens, plays through the opening, and carries on until the first event."
              song={music.opening}
              fallback="The background song plays."
            />
            <SongSlot
              slot="master"
              title="Background song"
              hint="Plays wherever no other song is set, and on the site's other pages."
              song={music.master}
              fallback="The site's built-in song plays."
            />
            <SongSlot
              slot="events_section"
              title="Events section song"
              hint="Plays while the Events section is on screen. On phones, an event's own song takes over on its card."
              song={music.events_section}
              fallback="The opening song keeps playing."
            />
          </div>

          <h2 className="mt-10 text-lg font-semibold text-zinc-900">A song for each event (phones)</h2>
          <p className="mt-1 text-sm text-zinc-600">
            On phones, events are shown one under another, so each can have its own song. On computers and tablets the
            Events section song plays instead. To use one song for two events, upload it to both.
          </p>
          <div className="mt-3 space-y-4">
            {(events ?? []).map((event) => (
              <SongSlot
                key={event.id}
                slot={`event:${event.id}`}
                title={event.name}
                hint="Plays on phones while this event's card is in the middle of the screen. If it's the guest's last event, it carries on to the end of the page."
                song={music.events[event.id] ?? null}
                fallback="The Events section song plays."
              />
            ))}
            {!events?.length && <p className="text-sm text-zinc-500">No events yet.</p>}
          </div>
        </>
      )}
    </div>
  );
}
