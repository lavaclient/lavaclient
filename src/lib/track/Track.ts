import { DataInput } from "./DataInput";

export const TRACK_INFO_VERSIONED = 1, TRACK_INFO_VERSION = 2;

export const decoders: Record<number, TrackInfoDecoder> = { 
    2: (input: DataInput) => {
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

        track.isSeekable = !track.isStream;
        return track as TrackInfo;
    },
};

export function decode(data: Uint8Array | string): TrackInfo | null {
    const input = new DataInput(data);

    return decoders[readVersion(input)]?.(input);
}

function readVersion(input: DataInput): number {
    const flags = input.readInt() >> 30;
    return flags & TRACK_INFO_VERSIONED ? input.readByte() : 1;
}

export type TrackInfo = import("@lavaclient/types").TrackInfo & { version: number }
export type TrackInfoDecoder = (input: DataInput) => TrackInfo | null;
