import type { ConfigContext, ExpoConfig } from "expo/config";
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? "SOUND ROOM",
  slug: config.slug ?? "sound-room",
  experiments: {
    ...config.experiments,
    baseUrl: process.env.SOUND_ROOM_WEB_BASE_PATH ?? "",
  },
});
