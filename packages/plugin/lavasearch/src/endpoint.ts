import * as Proto from "./protocol.js";
import * as API from "lavalink-api-client";

/**
 * Perform a LavaSearch query.
 */
export const executeLoadSearch = API.createEndpointMethod(Proto.RESTGetLoadSearch);
