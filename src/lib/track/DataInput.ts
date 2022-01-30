import { TextDecoder } from "util";

export class DataInput {
    private readonly buf: Uint8Array;
    private pos = 0;

    constructor (data: Uint8Array | string) {
        if (typeof data === "string") data = new Uint8Array(Buffer.from(data, "base64"));
        this.buf = data; 
    }

    readByte(): number {
        return this.buf[this.advance()];
    }

    readBoolean(): boolean {
        return this.readByte() !== 0;
    }
    
    readUnsignedShort(): number {
        return this.readBytes(2);
    }
    
    readInt(): number {
        return this.readBytes(4);
    }

    readLong(): BigInt {
        return BigInt(this.readBytes(4)) << 32n | BigInt(this.readBytes(4));
    }

    readUTF(): string {
        const length = this.readUnsignedShort()
            , start = this.advance(length);
        return new TextDecoder().decode(this.buf.slice(start, start + length));
    }

    private readBytes(length = 1): number {
        return Array.from({ length }, (_, i) => i * 8).reduceRight((r, i) => r | ((this.readByte() & 0xff) << i), 0);
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
