declare module "hls.js" {
  interface Level {
    height: number;
    bitrate: number;
  }
  interface ManifestParsedData {
    levels: Level[];
  }
  interface LevelSwitchedData {
    level: number;
  }
  const Events: {
    MANIFEST_PARSED: string;
    LEVEL_SWITCHED: string;
    [key: string]: string;
  };
  class Hls {
    static isSupported(): boolean;
    static Events: typeof Events;
    constructor(config?: Record<string, unknown>);
    loadSource(src: string): void;
    attachMedia(media: HTMLVideoElement): void;
    destroy(): void;
    on(event: string, callback: (event: string, data: any) => void): void;
  }
  export default Hls;
}
