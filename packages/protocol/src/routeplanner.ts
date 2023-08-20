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
export const ipBlockType = S.literal("Inet4Address", "Inet6Address");

export const failingAddress = S.struct({
    /**
     * The failing address.
     */
    failingAddress: S.string,
    /**
     * The timestamp when the address failed.
     */
    failingTimestamp: S.number,
    /**
     * The timestamp when the address failed, as a pretty string.
     */
    failingTime: S.string,
});

export const ipBlock = S.struct({
    /**
     * The type of ip block.
     */
    type: ipBlockType,
    /**
     * The size of the ip block.
     */
    size: S.string,
});

type StructFields = Parameters<typeof S.struct>[0];

const planner = <T extends AST.LiteralValue, O extends StructFields>(type: T, fields: O) =>
    S.struct({
        class: S.literal(type),
        details: S.struct({
            ipBlock,
            failingAddresses: S.array(failingAddress),
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
    rotateIndex: S.string,
    /**
     * The current offset in the block.
     */
    ipIndex: S.string,
    /**
     * The current address being used.
     */
    currentAddress: S.string,
});

/**
 * IP address used is switched on clock update. Use with at least 1 /64 IPv6 block.
 */
export const nanoIpRoutePlanner = planner("NanoIpRoutePlanner", {
    /**
     * The current offset in the ip block
     */
    currentAddressIndex: S.string,
});

/**
 * IP address used is switched on clock update, rotates to a different /64 block on ban. Use with at least 2x /64 IPv6 blocks.
 */
export const rotatingNanoIpRoutePlanner = planner("RotatingNanoIpRoutePlanner", {
    /**
     * The current offset in the ip block
     */
    currentAddressIndex: S.string,
    /**
     * The information in which /64 block ips are chosen. This number increases on each ban.
     */
    blockIndex: S.string,
});

/**
 * IP address used is selected at random per request. Recommended for larger IP blocks.
 */
export const balancingIpRoutePlanner = planner("BalancingIpRoutePlanner", {});

/**
 * Object describing the IP route planner for YouTube.
 */
export const ipRoutePlanner = S.union(
    rotatingIpRoutePlanner,
    nanoIpRoutePlanner,
    rotatingNanoIpRoutePlanner,
    balancingIpRoutePlanner,
);

export type IpBlockType = S.To<typeof ipBlockType>;

export type IpBlock = S.To<typeof ipBlock>;

export type FailingAddress = S.To<typeof failingAddress>;

export type RotatingIpRoutePlanner = S.To<typeof rotatingIpRoutePlanner>;

export type NanoIpRoutePlanner = S.To<typeof nanoIpRoutePlanner>;

export type RotatingNanoIpRoutePlanner = S.To<typeof rotatingNanoIpRoutePlanner>;

export type BalancingIpRoutePlanner = S.To<typeof balancingIpRoutePlanner>;

export type IpRoutePlanner = S.To<typeof ipRoutePlanner>;
