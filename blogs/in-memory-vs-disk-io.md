In ephemeral and serverless runtimes, file system access introduces latency bottlenecks, concurrency locks, and storage limit errors. Let's look at why Condense processes everything in-memory.

## The Cost of Disk I/O

When an HTTP API receives a file upload, traditional minifiers write the payload to `/tmp`, launch a subprocess targeting the temp file, read the output back, and then delete the temp file.

1. **Increased Latency**: Disk I/O adds 15–40ms of latency per request.
2. **Disk Space Exhaustion**: Concurrent uploads can easily consume `/tmp` allocation in serverless containers.
3. **Security Risks**: Residual temporary files on shared disk volumes pose data leakage risks.

## The Condense In-Memory Stream Solution

Condense uses Node.js `Buffer` objects and `PassThrough` streams to process data directly in memory:

- **Zero Disk Writes**: Memory buffers are garbage collected immediately after response transmission.
- **Constant Concurrency**: Scale linearly without hitting container I/O throttling limits.
- **Lower TTFB**: Reduced time-to-first-byte across high-throughput endpoints.

```javascript
const { optimizeMediaStream } = require('@studioframes/condense');

// Stream video without saving to disk
const { stream } = optimizeMediaStream(videoBuffer, 'video/mp4', 'quality');
```
