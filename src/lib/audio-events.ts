/**
 * Fired on window by the chat whenever it starts or stops using sound (reading
 * an answer aloud, or recording a spoken question), with `detail: boolean`.
 * The background music pauses meanwhile, so the two don't play over each
 * other and the microphone doesn't hear the song.
 */
export const CHAT_AUDIO_EVENT = "chat-audio";

export function signalChatAudio(active: boolean) {
  window.dispatchEvent(new CustomEvent<boolean>(CHAT_AUDIO_EVENT, { detail: active }));
}

/**
 * Whether the background music got going when the page opened: "playing",
 * "off" (the guest turned it off on an earlier visit) or "blocked" (the
 * browser wants a tap first). Kept on <html> and announced on window, so the
 * opening can wait for that tap and let it start the song.
 */
export type MusicState = "playing" | "off" | "blocked";
export const MUSIC_STATE_EVENT = "music-state";

export function signalMusicState(state: MusicState) {
  document.documentElement.dataset.music = state;
  window.dispatchEvent(new CustomEvent<MusicState>(MUSIC_STATE_EVENT, { detail: state }));
}

export function musicState(): MusicState | undefined {
  return document.documentElement.dataset.music as MusicState | undefined;
}
