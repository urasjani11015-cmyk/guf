export async function onRequest(context) {
  try {
    // 1. Apni asli image ka URL yahan dalein
    const imagePath = new URL('/ththth.jpg', context.request.url);
    const originResponse = await fetch(imagePath);
    
    if (!originResponse.ok) {
      return new Response('Image not found', { status: 404 });
    }

    const imageBuffer = await originResponse.arrayBuffer();

    // 2. Animated GIF Multi-frame Wrapper Header
    // Yeh binary bytes FB Debugger ko force karte hain "Animated: Yes" detect karne ke liye
    const gifHeader = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, // GIF89a Header
      0x01, 0x00, 0x01, 0x00,             // 1x1 Width/Height
      0xf0, 0x00, 0x00,                   // Global Color Table
      0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 
      0x21, 0xff, 0x0b,                   // Application Extension (Animation Loop)
      0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30, 
      0x03, 0x01, 0x00, 0x00, 0x00, 
      0x21, 0xf9, 0x04, 0x00, 0x64, 0x00, 0x00, 0x00 // Frame Delay (Looping Enabled)
    ]);

    // Header aur original image buffer ko merge karna
    const combinedBuffer = new Uint8Array(gifHeader.length + imageBuffer.byteLength);
    combinedBuffer.set(gifHeader, 0);
    combinedBuffer.set(new Uint8Array(imageBuffer), gifHeader.length);

    return new Response(combinedBuffer.buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Content-Disposition': 'inline; filename="thumb.gif"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (err) {
    return new Response('Error: ' + err.message, { status: 500 });
  }
}
