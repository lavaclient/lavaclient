import { DataInput } from "./DataInput";

export const TRACK_INFO_VERSIONED = 1, TRACK_INFO_VERSION = 2;

export const decoders: Record<number, TrackInfoDecoder> = { 
    2: input => {
        const track: Partial<TrackInfo> = { 
            title:      input.readUTF(), 
            author:     input.readUTF(), 
            length:     Number(input.readLong()), 
            identifier: input.readUTF(), 
            isStream:   input.readBoolean(), 
            uri:        input.readBoolean() ? input.readUTF() : "", 
            sourceName: input.readUTF(),
            version:    2
        };

        if (["local", "http"].includes(track.sourceName ?? "")) {
            const [name, parameters] = input.readUTF().split("|");
            track.probeInfo = { name, parameters };
        }

        track.position = Number(input.readLong());
        track.isSeekable = !track.isStream;
        return track as TrackInfo;
    },
};

export function decode(data: Uint8Array | string): TrackInfo | null {
    const input = new DataInput(data);

    return decoders[readVersion(input)]?.(input);
}

function readVersion(input: DataInput): number {
    const flags = (input.readInt() & 0xC0000000) >> 30;
    return flags & TRACK_INFO_VERSIONED ? input.readByte() : 1;
}

export type TrackInfo = import("@lavaclient/types").TrackInfo & { 
    version: number;
    probeInfo: { 
        name: string;
        parameters?: string;
    }
}
export type TrackInfoDecoder = (input: DataInput) => TrackInfo | null;
