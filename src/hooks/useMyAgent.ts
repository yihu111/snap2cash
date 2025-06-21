import { useConversation } from "@elevenlabs/react";

export function useMyAgent(onTranscript: (evt: any) => void) {
  return useConversation({
    onMessage: (evt: any) => {
      if (evt.type === "transcription" && evt.isFinal && evt.text) {
        onTranscript(evt);
      }
    },
  });
}
