Audio and video files present unique challenges due to their large sizes. In this guide, we dive into how Condense handles video streaming with zero-copy PassThrough streams.

## Streaming vs Buffering Media

For large files like MP4 or WAV, storing the entire file in RAM can trigger high memory consumption. Condense handles media optimization via streaming:

```javascript
const { optimizeMediaStream } = require('@studioframes/condense');

// Returns a Node.js PassThrough stream for zero-copy memory efficiency
const { stream, outMime } = optimizeMediaStream(rawVideoBuffer, 'video/mp4', 'quality');
stream.pipe(res);
```

## Best Practices

- Use `method: 'quality'` for lossless media streaming.
- Use `method: 'balanced'` when network bandwidth is prioritized.
- Always set appropriate `Content-Type` headers when piping media streams to HTTP responses.
