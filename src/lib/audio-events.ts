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
