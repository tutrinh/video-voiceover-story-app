import { ScriptData } from '../types/script';

function formatSrtTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const millis = Math.floor((totalSeconds % 1) * 1000);

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const ms = String(millis).padStart(3, '0');

  return `${hh}:${mm}:${ss},${ms}`;
}

export function generateSrtContent(script: ScriptData): string {
  let currentTime = 0;
  const srtBlocks: string[] = [];

  script.beats.forEach((beat, idx) => {
    const startTime = currentTime;
    const endTime = startTime + beat.estimatedSeconds;
    currentTime = endTime;

    const blockNumber = idx + 1;
    const timeRange = `${formatSrtTime(startTime)} --> ${formatSrtTime(endTime)}`;
    const text = beat.text;

    srtBlocks.push(`${blockNumber}\n${timeRange}\n${text}\n`);
  });

  return srtBlocks.join('\n');
}

export function downloadTextFile(filename: string, content: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadAudioBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadSrtFile(script: ScriptData): void {
  const srtContent = generateSrtContent(script);
  downloadTextFile(`${script.title.replace(/\s+/g, '_')}_captions.srt`, srtContent, 'text/plain');
}
