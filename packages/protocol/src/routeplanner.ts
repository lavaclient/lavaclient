import * as AST from "@effect/schema/AST";
import * as S from "@effect/schema/Schema";

/**
 * The type of ip block.
 *
 * - `Inet4Address`
 *   An IP v4 ip block.
 *
 * - `Inet6Address`
 *   An IP v6 ip block.
 */
export const ipBlockType = S.Literal("Inet4Address", "Inet6Address");

export const failingAddress = S.Struct({
    /**
     * The failing address.
     */
    failingAddress: S.String,
    /**
     * The timestamp when the address failed.
     */
    failingTimestamp: S.Number,
    /**
     * The timestamp when the address failed, as a pretty string.
     */
    failingTime: S.String,
});

export const ipBlock = S.Struct({
    /**
     * The type of ip block.
     */
    type: ipBlockType,
    /**
     * The size of the ip block.
     */
    size: S.String,
});

type StructFields = Parameters<typeof S.Struct>[0];

const planner = <T extends AST.LiteralValue, O extends StructFields>(type: T, fields: O) =>
    S.Struct({
        class: S.Literal(type),
        details: S.Struct({
            ipBlock,
            failingAddresses: S.Array(failingAddress),
            ...fields,
        }),
    });

/**
 * IP address used is switched on ban. Recommended for IPv4 blocks or IPv6 blocks smaller than a /64.
 */
export const rotatingIpRoutePlanner = planner("RotatingIpRoutePlanner", {
    /**
     * The number of rotations.
     */
    rotateIndex: S.String,
    /**
     * The current offset in the block.
     */
    ipIndex: S.String,
    /**
     * The current address being used.
     */
    currentAddress: S.String,
});

/**
 * IP address used is switched on clock update. Use with at least 1 /64 IPv6 block.
 */
export const nanoIpRoutePlanner = planner("NanoIpRoutePlanner", {
    /**
     * The current offset in the ip block
     */
    currentAddressIndex: S.String,
});

/**
 * IP address used is switched on clock update, rotates to a different /64 block on ban. Use with at least 2x /64 IPv6 blocks.
 */
export const rotatingNanoIpRoutePlanner = planner("RotatingNanoIpRoutePlanner", {
    /**
     * The current offset in the ip block
     */
    currentAddressIndex: S.String,
    /**
     * The information in which /64 block ips are chosen. This number increases on each ban.
     */
    blockIndex: S.String,
});

/**
 * IP address used is selected at random per request. Recommended for larger IP blocks.
 */
export const balancingIpRoutePlanner = planner("BalancingIpRoutePlanner", {});

/**
 * Object describing the IP route planner for YouTube.
 */
export const ipRoutePlanner = S.Union(
    rotatingIpRoutePlanner,
    nanoIpRoutePlanner,
    rotatingNanoIpRoutePlanner,
    balancingIpRoutePlanner,
);

export type IpBlockType = S.Schema.Type<typeof ipBlockType>;

export type IpBlock = S.Schema.Type<typeof ipBlock>;

export type FailingAddress = S.Schema.Type<typeof failingAddress>;

export type RotatingIpRoutePlanner = S.Schema.Type<typeof rotatingIpRoutePlanner>;

export type NanoIpRoutePlanner = S.Schema.Type<typeof nanoIpRoutePlanner>;

export type RotatingNanoIpRoutePlanner = S.Schema.Type<typeof rotatingNanoIpRoutePlanner>;

export type BalancingIpRoutePlanner = S.Schema.Type<typeof balancingIpRoutePlanner>;

export type IpRoutePlanner = S.Schema.Type<typeof ipRoutePlanner>;
