import type { TrackInfo } from "@lavaclient/types/v3";
import { DataInput } from "./DataInput";

export const TRACK_INFO_VERSIONED = 1, TRACK_INFO_VERSION = 2;

export const decoders: Record<number, TrackInfoDecoder> = {
    2: input => {
        const track: Partial<DecodedTrackInfo> = {
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
        return track as DecodedTrackInfo;
    },
};


function readVersion(input: DataInput): number {
    const flags = (input.readInt() & 0xC0000000) >> 30;
    return flags & TRACK_INFO_VERSIONED ? input.readByte() : 1;
}

// TODO: improve return type
export function decode(data: Uint8Array | string): DecodedTrackInfo | null {
    const input   = new DataInput(data)
        , version = readVersion(input);

    return decoders[version]?.(input) ?? null;
}

export type DecodedTrackInfo = TrackInfo & {
    version: number;
    probeInfo: { 
        name: string;
        parameters?: string;
    }
}
export type TrackInfoDecoder = (input: DataInput) => DecodedTrackInfo | null;
