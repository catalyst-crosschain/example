declare module 'use-sound' {
    type PlayFunction = () => void;
    type HookOptions = {
      volume?: number;
      playbackRate?: number;
      interrupt?: boolean;
      soundEnabled?: boolean;
      sprite?: Record<string, [number, number]>;
    };
  
    type UseSound = (src: string, options?: HookOptions) => [PlayFunction, { sound: any; stop: () => void }];
  
    const useSound: UseSound;
    export default useSound;
  }