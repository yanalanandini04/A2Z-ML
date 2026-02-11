
// Decode base64 string to Uint8Array
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper for writing strings into a DataView for the WAV header
function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

/**
 * Converts raw PCM audio data into a Blob with a valid WAV header.
 * @param pcmData The raw audio data.
 * @param sampleRate The sample rate of the audio (e.g., 24000).
 * @param numChannels The number of channels (e.g., 1 for mono).
 * @param bitsPerSample The bit depth (e.g., 16).
 * @returns A Blob object representing the WAV file.
 */
export function pcmToWavBlob(
    pcmData: Uint8Array,
    sampleRate: number,
    numChannels: number,
    bitsPerSample: number,
): Blob {
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = pcmData.length;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true); // chunkSize
    writeString(view, 8, 'WAVE');

    // "fmt " sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // audioFormat (1 for PCM)
    view.setUint16(22, numChannels, true); // numChannels
    view.setUint32(24, sampleRate, true); // sampleRate
    view.setUint32(28, byteRate, true); // byteRate
    view.setUint16(32, blockAlign, true); // blockAlign
    view.setUint16(34, bitsPerSample, true); // bitsPerSample

    // "data" sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true); // subchunk2Size

    // Write PCM data
    for (let i = 0; i < pcmData.length; i++) {
        view.setUint8(44 + i, pcmData[i]);
    }

    return new Blob([view], { type: 'audio/wav' });
}
