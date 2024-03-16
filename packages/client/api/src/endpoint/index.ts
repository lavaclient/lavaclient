import * as LP from "lavalink-protocol";

import { createEndpointMethod } from "./factory.js";

/**
 * Update a session.
 */
export const executeUpdateSession = createEndpointMethod(LP.RESTPatchAPISession);

/**
 * Get a player of a session.
 */
export const executeGetSessionPlayer = createEndpointMethod(LP.RESTGetAPIPlayer);

/**
 * Get all players of a session.
 */
export const executeGetSessionPlayers = createEndpointMethod(LP.RESTGetAPIPlayers);

/**
 * Update a player.
 */
export const executeUpdatePlayer = createEndpointMethod(LP.RESTPatchAPIPlayer);

/**
 * Delete a player.
 */
export const executeDeletePlayer = createEndpointMethod(LP.RESTDeleteAPIPlayer);

/**
 * Get the information of the lavalink node.
 */
export const executeInfo = createEndpointMethod(LP.RESTGetAPINodeInfo);

/**
 * Get the version of the lavalink node.
 */
export const executeVersion = createEndpointMethod(LP.RESTGetAPINodeVersion);

/**
 * Get the statistics of the lavalink node.
 */
export const executeStats = createEndpointMethod(LP.RESTGetAPINodeStats);

/**
 *
 */
export const executeLoadTracks = createEndpointMethod(LP.RESTGetAPILoadTracks);

/**
 * Decode a track.
 */
export const executeDecodeTrack = createEndpointMethod(LP.RESTGetAPIDecodeTrack);

/**
 * Decode a list of tracks.
 */
export const executeDecodeTracks = createEndpointMethod(LP.RESTPostAPIDecodeTracks);

/**
 * Get the status of the route planner.
 */
export const executeGetRoutePlannerStatus = createEndpointMethod(LP.RESTGetAPIRoutePlannerStatus);

/**
 * Free a specific address for future use.
 */
export const executeFreeRoutePlannerAddress = createEndpointMethod(LP.RESTPostAPIFreeFailedAddress);

/**
 * Free all failed addresses for future use.
 */
export const executeFreeRoutePlannerAddresses = createEndpointMethod(LP.RESTPostAPIFreeAllFailedAddresses);
