declare global {
  interface MIDIConnectionEvent extends Event {
    port?: MIDIPort | null;
  }

  interface MIDIPort extends EventTarget {
    readonly id: string;
    readonly manufacturer?: string;
    readonly name?: string;
    readonly state?: 'connected' | 'disconnected' | string;
    readonly type?: 'input' | 'output' | string;
  }

  interface MIDIInput extends MIDIPort {
    onmidimessage: ((event: MIDIMessageEvent) => void) | null;
  }

  interface MIDIOutput extends MIDIPort {}

  interface MIDIMessageEvent extends Event {
    readonly data: Uint8Array;
  }

  interface MIDIAccess extends EventTarget {
    readonly inputs: Map<string, MIDIInput>;
    readonly outputs: Map<string, MIDIOutput>;
    onstatechange: ((event: MIDIConnectionEvent) => void) | null;
  }

  interface Navigator {
    requestMIDIAccess?: (options?: { sysex?: boolean }) => Promise<MIDIAccess>;
  }
}

export {};
