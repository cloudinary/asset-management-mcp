# Running the MCP Server with Docker

This document provides instructions on how to build and run the Model Context Protocol (MCP) server using Docker.

## ⚠️ Security: the SSE transport is a network service

When started with `--transport sse`, the server accepts MCP sessions **using the Cloudinary credentials it
was started with**. Anyone who can reach the port can drive your Cloudinary account (list, upload, delete
assets, etc.). Protect it accordingly:

- **Loopback by default.** The server now binds to `127.0.0.1` unless you pass `--host`. A loopback-only
  server is not reachable from other hosts and needs no token.
- **Exposing it on the network requires a token.** To bind a non-loopback interface (e.g. `--host 0.0.0.0`,
  which is what Docker port-mapping needs), you **must** also set a shared secret via `--auth-token` or the
  `MCP_AUTH_TOKEN` environment variable. The server refuses to start otherwise.
- **Sending the token.** Clients must present it on `/sse` and `/message` as either
  `x-mcp-token: <token>` or `Authorization: Bearer <token>`. Requests without a valid token get `401`.
- Prefer a strong, random token, and terminate TLS in front of the server for anything beyond a trusted LAN.

> Because Docker forwards published ports to the container's network interface (not its loopback), every
> `docker run -p ...` example below includes `--host 0.0.0.0` and an auth token.

## Building the Image

You can build the Docker image in two ways: from a local clone of the repository or directly from GitHub.

### Building from a Local Clone

First, build the Docker image from the root of the project:

```sh
docker build -t cloudinary-asset-management-mcp .
```

### Building from GitHub

You can also build the image directly from the GitHub repository without cloning it first.

```sh
docker build -t cloudinary-asset-management-mcp https://github.com/cloudinary/asset-management-mcp.git
```

## Running the Container

The MCP server requires Cloudinary credentials to run. You can provide these credentials in one of three ways. When running the `docker run` command, you will also map a local port (e.g., `2718`) to the container's port `2718`.

**Note:** Replace `<your_cloud_name>`, `<your_api_key>`, and `<your_api_secret>` with your actual Cloudinary credentials.

### Option 1: Using Individual Environment Variables

This is the recommended method.

```sh
docker run -d -p 2718:2718 \
  -e CLOUDINARY_CLOUD_NAME="<your_cloud_name>" \
  -e CLOUDINARY_API_KEY="<your_api_key>" \
  -e CLOUDINARY_API_SECRET="<your_api_secret>" \
  -e MCP_AUTH_TOKEN="<a_strong_random_secret>" \
  cloudinary-asset-management-mcp start --transport sse --host 0.0.0.0
```

`--host 0.0.0.0` makes the server reachable through the published Docker port; `MCP_AUTH_TOKEN` is then
required (see [Security](#-security-the-sse-transport-is-a-network-service)). You may pass the token as
`--auth-token "<...>"` instead of the env var.

**Note:** If you have these variables already set in your shell environment, you can pass them directly to the container without specifying the values:

```sh
docker run -d -p 2718:2718 \
  -e CLOUDINARY_CLOUD_NAME \
  -e CLOUDINARY_API_KEY \
  -e CLOUDINARY_API_SECRET \
  -e MCP_AUTH_TOKEN \
  cloudinary-asset-management-mcp start --transport sse --host 0.0.0.0
```

### Option 2: Using Command-Line Arguments

You can also provide the credentials as arguments to the `start` command.

```sh
docker run -d -p 2718:2718 \
  cloudinary-asset-management-mcp start --transport sse \
  --host 0.0.0.0 \
  --auth-token "<a_strong_random_secret>" \
  --cloud-name "<your_cloud_name>" \
  --api-key "<your_api_key>" \
  --api-secret "<your_api_secret>"
```

### Option 3: Using `CLOUDINARY_URL` Environment Variable

This method combines all credentials into a single URL.

```sh
docker run -d -p 2718:2718 \
  -e CLOUDINARY_URL="cloudinary://<your_api_key>:<your_api_secret>@<your_cloud_name>" \
  -e MCP_AUTH_TOKEN="<a_strong_random_secret>" \
  cloudinary-asset-management-mcp start --transport sse --host 0.0.0.0
```

**Note:** If you have the `CLOUDINARY_URL` and `MCP_AUTH_TOKEN` variables already set in your shell environment, you can pass them directly:

```sh
docker run -d -p 2718:2718 -e CLOUDINARY_URL -e MCP_AUTH_TOKEN cloudinary-asset-management-mcp start --transport sse --host 0.0.0.0
```

## Connecting to the Server

Once the container is running with the SSE transport enabled (as shown in the commands above), the MCP server is available at the following endpoint:

`http://localhost:2718/sse`

If you are running Docker on a different host, replace `localhost` with the appropriate hostname or IP address.

Because the examples above expose the server on the network, clients must authenticate with the token from
`--auth-token` / `MCP_AUTH_TOKEN` on every request, e.g.:

```sh
curl -N -H "Authorization: Bearer <a_strong_random_secret>" http://localhost:2718/sse
```

Requests without a valid token receive `401 Unauthorized`.

## Stopping the Container

You can find the container ID by running `docker ps` and then stop it using `docker stop`.

To stop the container started from the `cloudinary-asset-management-mcp` image:
```sh
docker stop $(docker ps -a -q --filter "ancestor=cloudinary-asset-management-mcp")
```

## Viewing Logs

You can view the logs from your running container to monitor its output or troubleshoot issues.

First, find the ID of your container:
```sh
docker ps
```
This will list all running containers, including their IDs.

### Static Logs

To see all logs that have been generated so far, use the `docker logs` command with the container ID.

```sh
docker logs <your_container_id>
```

### Live Logs

To see logs in real time, add the `--follow` (or `-f`) flag.

```sh
docker logs --follow <your_container_id>
```

Press `Ctrl+C` to stop following the logs.

## Debugging

You can enable more detailed logging for troubleshooting in two ways.

### Using the `--log-level` Flag

Set the `--log-level` flag to `debug` when starting the container.

```sh
docker run -d -p 2718:2718 \
  -e CLOUDINARY_URL \
  -e MCP_AUTH_TOKEN \
  cloudinary-asset-management-mcp start --transport sse --host 0.0.0.0 --log-level debug
```

### Using the `CLOUDINARY_DEBUG` Environment Variable

You can also enable a debug logger by setting the `CLOUDINARY_DEBUG` environment variable to `true`.

```sh
docker run -d -p 2718:2718 \
  -e CLOUDINARY_URL \
  -e CLOUDINARY_DEBUG=true \
  -e MCP_AUTH_TOKEN \
  cloudinary-asset-management-mcp start --transport sse --host 0.0.0.0
```

