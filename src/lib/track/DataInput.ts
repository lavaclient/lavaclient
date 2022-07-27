import { TextDecoder } from "node:util";

const decoder = new TextDecoder();

export class DataInput {
    private readonly buf: Uint8Array;
    private readonly view: DataView;
    private pos = 0;

    constructor(data: Uint8Array | string) {
        if (typeof data === "string") data = new Uint8Array(Buffer.from(data, "base64"));
        this.buf = data;
        this.view = new DataView(this.buf.buffer);
    }

    readByte(): number {
        return this.view.getUint8(this.advance());
    }

    readBoolean(): boolean {
        return this.readByte() !== 0;
    }

    readUnsignedShort(): number {
        return this.view.getUint16(this.advance(2));
    }

    readInt(): number {
        return this.view.getInt32(this.advance(4));
    }

    readLong(): bigint {
        return this.view.getBigInt64(this.advance(8));
    }

    readUTF(): string {
        const length = this.readUnsignedShort()
            , start  = this.advance(length);

        return decoder.decode(this.buf.slice(start, start + length));
    }

    private advance(by = 1): number {
        if (this.pos + by > this.buf.length) {
            throw new Error(`EOF: unable to read ${by} bytes.`);
        }

        const cpos = this.pos;
        this.pos += by;

        return cpos;
    }
}
