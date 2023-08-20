# Lavalink API Client

A type-safe API client for [Lavalink](https://lavalink.dev), it uses the [lavalink-protocol](https://npmjs.com/lavalink-protocol) package.

## 🛟 Need Support?

Feel free to join our [Discord Server](https://discord.gg/8R4d8RydT4).

## 🧑‍💻 Examples

To start using `lavalink-api-client` you must create an API client.

```ts
import { LavalinkAPIClient } from "lavalink-api-client";

const client = new LavalinkAPIClient({
    host: "127.0.0.1",
    port: 2333,
    auth: "youshallnotpass",
});
```

### 📡 Making Requests

You can either make the requests manually or use our custom type-safe methods for each endpoint.

#### Manual Requests

This is great if you want to make a request to an endpoint that isn't supported by the client or if you just want to break the rules :3

```ts
import type { RESTGetAPINodeInfo } from "lavalink-protocol";

const response = await client.execute({
    path: "/v4/info",
    method: "GET",
});

const data: RESTGetAPINodeInfo = await response.json();
// Hope and pray that the data is correct.
```

#### Type-safe helpers

These ensure that the data from the JSON body, query parameters, and response body are in compliance with the lavalink protocol.

> Syntax is `execute<Endpoint>(client, request info, extra request options)`


```ts
import { executeInfo } from "lavalink-api-client";

const response = await executeInfo(client, {}, {});
//    ^? RESTGetAPINodeInfo
```

### ❌ Error Handling

Error handling is a #1 priority for us, so we've made it extremely easy to handle errors.

```ts
import { isLavalinkHTTPError, isLavalinkAPIError } from "lavalink-api-client";

try {
    // execute a request.
} catch (ex) {
    if (isLavalinkAPIError(ex)) {
        // handle API error.
        console.log(ex.data.status);
    }

    if (isLavalinkHTTPError(ex)) {
        // handle HTTP error.
    }
}
```

The different reasons an HTTP error may occur are:
1. The response body couldn't be decoded.
2. The request failed to send.
3. Lavalink returned an error.
4. Something unknown happened.
5. A validation error occurred.
6. The request was aborted.

> Differences between an HTTP and API Error:
> - `LavalinkHTTPError`'s are thrown when something went wrong somewhere in the request - most originate from the client.
> - `LavalinkAPIError`'s are thrown when Lavalink returns a non 2.x.x status code - although these extend HTTP errors, they only originate from Lavalink.
>
> tl;dr HTTP errors indicate a general error, API errors indicate Lavalink returned an error.

---

[lavaclient](https://lavaclient.js.org) &copy; 2020 - Current Year
