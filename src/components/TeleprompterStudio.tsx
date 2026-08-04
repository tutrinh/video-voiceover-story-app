import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  Mic,
  MicOff,
  RotateCcw,
  Volume2,
  Download,
  FileText,
  Subtitles,
  Flame,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Music,
  ListMusic
} from 'lucide-react';
import { ScriptData, VoiceTake, SavedStory } from '../types/script';
import { downloadSrtFile } from '../utils/srtExporter';

interface TeleprompterStudioProps {
  script: ScriptData;
  onSaveStory?: (story: SavedStory) => void;
}

export const TeleprompterStudio: React.FC<TeleprompterStudioProps> = ({
  script,
  onSaveStory,
}) => {
  // Teleprompter Auto-scroll State
  const [isPlayingPrompter, setIsPlayingPrompter] = useState(false);
  const [prompterSpeedWpm, setPrompterSpeedWpm] = useState(140);
  const [fontSizePx, setFontSizePx] = useState(24);
  const [activeBeatIndex, setActiveBeatIndex] = useState(0);

  // Audio Visualizer & MediaRecorder State
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPausedRecording, setIsPausedRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Takes & Audio Playback State
  const [takes, setTakes] = useState<VoiceTake[]>([]);
  const [activeTakeId, setActiveTakeId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPlaylistMode, setIsPlaylistMode] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // Refs
  const prompterContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<any>(null);

  // Check microphone permissions on mount
  useEffect(() => {
    checkMicPermissions();
  }, []);

  const checkMicPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      // Stop temporary stream track
      stream.getTracks().forEach((t) => t.stop());
    } catch (err) {
      console.error('Mic permission denied:', err);
      setHasMicPermission(false);
    }
  };

  // Start Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Setup Web Audio Analyser for Visualizer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
      drawWaveform();

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const newTake: VoiceTake = {
          id: `take_${Date.now()}`,
          takeNumber: takes.length + 1,
          audioBlob,
          audioUrl,
          createdAt: Date.now(),
          durationSeconds: recordingSeconds,
        };

        setTakes((prev) => [...prev, newTake]);
        setActiveTakeId(newTake.id);
        setIsRecording(false);
        setIsPausedRecording(false);
        setRecordingSeconds(0);

        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }

        // Clean up audio tracks
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setIsPausedRecording(false);

      // Start Recording Timer
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Microphone access is required to record voiceovers.');
    }
  };

  const togglePauseRecording = () => {
    if (!mediaRecorderRef.current) return;
    if (isPausedRecording) {
      mediaRecorderRef.current.resume();
      setIsPausedRecording(false);
    } else {
      mediaRecorderRef.current.pause();
      setIsPausedRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Draw Audio Frequency Visualizer Canvas
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        // Gradient bar styling Metronic Blue/Purple
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#3e97ff');
        gradient.addColorStop(1, '#7239ea');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }
    };

    render();
  };

  // Teleprompter Auto-scroll Effect
  useEffect(() => {
    let scrollInterval: any = null;
    if (isPlayingPrompter && prompterContainerRef.current) {
      const pixelsPerSecond = (prompterSpeedWpm / 60) * 12;
      scrollInterval = setInterval(() => {
        if (prompterContainerRef.current) {
          prompterContainerRef.current.scrollTop += pixelsPerSecond / 10;
        }
      }, 100);
    }
    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [isPlayingPrompter, prompterSpeedWpm]);

  // Audio Playback Controls
  const activeTake = takes.find((t) => t.id === activeTakeId) || takes[0];

  const togglePlayAudio = () => {
    if (!audioPlayerRef.current || !activeTake) return;

    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Play All Takes sequentially in Playlist Mode
  const handlePlayAllRecordings = () => {
    if (takes.length === 0) return;
    setIsPlaylistMode(true);
    const firstTake = takes[0];
    setActiveTakeId(firstTake.id);
    setIsPlayingAudio(true);

    setTimeout(() => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = firstTake.audioUrl;
        audioPlayerRef.current.play();
      }
    }, 100);
  };

  // When audio take finishes, automatically advance to next take in playlist mode
  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
    if (isPlaylistMode && takes.length > 0) {
      const currentIndex = takes.findIndex((t) => t.id === activeTakeId);
      if (currentIndex >= 0 && currentIndex < takes.length - 1) {
        const nextTake = takes[currentIndex + 1];
        setActiveTakeId(nextTake.id);
        setIsPlayingAudio(true);
        setTimeout(() => {
          if (audioPlayerRef.current) {
            audioPlayerRef.current.src = nextTake.audioUrl;
            audioPlayerRef.current.play();
          }
        }, 150);
      } else {
        setIsPlaylistMode(false);
      }
    }
  };

  const downloadAudioBlob = (filename: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxtScript = () => {
    const scriptText = script.beats.map((b) => `[${b.header}]\n${b.text}\nVisual Cue: ${b.visualCue}\nDelivery Tip: ${b.deliveryTip}\n`).join('\n---\n\n');
    const blob = new Blob([scriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title.replace(/\s+/g, '_')}_script.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Studio Header Card */}
      <div className="metronic-card p-6 bg-gradient-to-r from-[#181924] via-[#1e1f29] to-[#151620] border-[#2b2d3c] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="metronic-badge metronic-badge-primary">{script.framework.toUpperCase()}</span>
            <span className="text-xs text-[#9a9cae]">AI Model: {script.modelUsed} ({script.engineUsed})</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            {script.title}
          </h2>
          <p className="text-sm text-[#9a9cae] mt-1">
            Topic: <span className="text-white font-medium">{script.topic}</span> • Target: <span className="text-[#3e97ff] font-bold">{script.estimatedDurationSeconds}s</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadSrtFile(script)}
            className="metronic-btn-secondary py-2 px-3 text-xs flex items-center space-x-1.5 hover:border-[#3e97ff] hover:text-[#3e97ff]"
          >
            <Subtitles className="w-3.5 h-3.5 text-[#3e97ff]" />
            <span>Download .SRT Captions</span>
          </button>

          <button
            onClick={handleDownloadTxtScript}
            className="metronic-btn-secondary py-2 px-3 text-xs flex items-center space-x-1.5 hover:border-[#7239ea] hover:text-[#7239ea]"
          >
            <FileText className="w-3.5 h-3.5 text-[#7239ea]" />
            <span>Export TXT Script</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Teleprompter Screen */}
        <div className="lg:col-span-2 space-y-4">
          <div className="metronic-card p-5 space-y-4 relative overflow-hidden">
            {/* Prompter Controls Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2b2d3c] pb-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsPlayingPrompter(!isPlayingPrompter)}
                  className="metronic-btn-primary py-2 px-4 text-xs font-bold flex items-center space-x-2 shadow-md shadow-[#3e97ff]/20"
                >
                  {isPlayingPrompter ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Scroll</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                      <span>Auto-Scroll Prompter</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsPlayingPrompter(false);
                    if (prompterContainerRef.current) prompterContainerRef.current.scrollTop = 0;
                    setActiveBeatIndex(0);
                  }}
                  className="metronic-btn-secondary p-2 rounded-xl"
                  title="Reset Scroll to Top"
                >
                  <RotateCcw className="w-4 h-4 text-[#9a9cae]" />
                </button>
              </div>

              {/* Speed WPM & Font Sliders */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-[#9a9cae]">Speed:</span>
                  <input
                    type="range"
                    min="100"
                    max="250"
                    value={prompterSpeedWpm}
                    onChange={(e) => setPrompterSpeedWpm(Number(e.target.value))}
                    className="w-20 accent-[#3e97ff]"
                  />
                  <span className="font-mono text-white text-[11px]">{prompterSpeedWpm} WPM</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[#9a9cae]">Size:</span>
                  <input
                    type="range"
                    min="18"
                    max="36"
                    value={fontSizePx}
                    onChange={(e) => setFontSizePx(Number(e.target.value))}
                    className="w-16 accent-[#7239ea]"
                  />
                </div>
              </div>
            </div>

            {/* Scrollable Prompter Text Area */}
            <div
              ref={prompterContainerRef}
              className="h-[clamp(780px,85vh,960px)] overflow-y-auto p-6 bg-[#0f1015] rounded-xl border border-[#2b2d3c] space-y-6 scroll-smooth select-none"
            >
              {script.beats.map((beat, idx) => {
                const isSelected = activeBeatIndex === idx;
                return (
                  <div
                    key={beat.beatIndex}
                    onClick={() => setActiveBeatIndex(idx)}
                    className={`teleprompter-card p-5 rounded-xl transition-all cursor-pointer ${
                      isSelected ? 'active border-[#3e97ff]' : 'opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          isSelected
                            ? 'bg-[#3e97ff] text-white'
                            : 'bg-[#2b2d3c] text-[#9a9cae]'
                        }`}
                      >
                        {beat.header}
                      </span>
                      <span className="text-[#9a9cae] font-mono">~{beat.estimatedSeconds}s timing</span>
                    </div>

                    <p
                      style={{ fontSize: `${fontSizePx}px`, lineHeight: 1.4 }}
                      className="font-medium text-white tracking-wide"
                    >
                      {beat.text}
                    </p>

                    {/* Keywords & Visual Cue */}
                    <div className="mt-3 pt-3 border-t border-[#2b2d3c]/60 flex flex-wrap items-center justify-between text-xs text-[#9a9cae]">
                      <div className="flex items-center space-x-1 text-[#3e97ff]">
                        <Flame className="w-3.5 h-3.5" />
                        <span className="font-semibold">{beat.visualCue}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-[#6c7086]">Tip:</span>
                        <span className="text-white italic">{beat.deliveryTip}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Beat Navigation Buttons */}
            <div className="flex items-center justify-between text-xs">
              <button
                disabled={activeBeatIndex === 0}
                onClick={() => setActiveBeatIndex((prev) => Math.max(0, prev - 1))}
                className="metronic-btn-secondary py-2 text-xs flex items-center space-x-1 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Beat</span>
              </button>

              <span className="text-[#9a9cae]">
                Beat <span className="text-white font-bold">{activeBeatIndex + 1}</span> of{' '}
                <span className="text-white font-bold">{script.beats.length}</span>
              </span>

              <button
                disabled={activeBeatIndex === script.beats.length - 1}
                onClick={() =>
                  setActiveBeatIndex((prev) => Math.min(script.beats.length - 1, prev + 1))
                }
                className="metronic-btn-secondary py-2 text-xs flex items-center space-x-1 disabled:opacity-40"
              >
                <span>Next Beat</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Voice Recorder & Takes Manager */}
        <div className="space-y-6">
          {/* Recorder Controls */}
          <div className="metronic-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2b2d3c] pb-3">
              <div className="flex items-center space-x-2">
                <Mic className="w-4 h-4 text-[#3e97ff]" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  Voiceover Recorder
                </h3>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                  hasMicPermission
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${hasMicPermission ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span>{hasMicPermission ? 'Mic Ready' : 'Mic Blocked'}</span>
              </span>
            </div>

            {/* Live Audio Visualizer Canvas */}
            <div className="h-24 bg-[#0f1015] rounded-xl border border-[#2b2d3c] flex items-center justify-center relative overflow-hidden">
              {isRecording ? (
                <canvas ref={canvasRef} width={280} height={80} className="w-full h-full" />
              ) : (
                <div className="text-center space-y-1">
                  <Volume2 className="w-6 h-6 text-[#6c7086] mx-auto opacity-50" />
                  <p className="text-xs text-[#9a9cae]">Press record to capture voiceover take</p>
                </div>
              )}

              {/* Timer Pill overlay */}
              {isRecording && (
                <div className="absolute top-2 right-2 bg-red-500 text-white font-mono text-xs px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                  {recordingSeconds}s
                </div>
              )}
            </div>

            {/* Record Action Buttons */}
            <div className="flex items-center justify-center space-x-3 pt-2">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="metronic-btn-danger w-full py-3 flex items-center justify-center space-x-2 recording-pulse"
                >
                  <div className="w-3 h-3 rounded-full bg-white animate-ping" />
                  <span className="text-sm font-bold">Start Recording Take</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={togglePauseRecording}
                    className="metronic-btn-secondary flex-1 py-3 text-xs font-semibold flex items-center justify-center space-x-1.5"
                  >
                    <Pause className="w-4 h-4 text-amber-400" />
                    <span>{isPausedRecording ? 'Resume' : 'Pause'}</span>
                  </button>

                  <button
                    onClick={stopRecording}
                    className="metronic-btn-danger flex-1 py-3 text-xs font-semibold flex items-center justify-center space-x-1.5"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>Stop Take</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Takes Manager & Playback Player */}
          {takes.length > 0 && (
            <div className="metronic-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#2b2d3c] pb-3">
                <div className="flex items-center space-x-2">
                  <Music className="w-4 h-4 text-[#3e97ff]" />
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                    Voiceover Takes ({takes.length})
                  </h3>
                </div>

                {/* PLAY ALL RECORDINGS BUTTON */}
                <button
                  onClick={handlePlayAllRecordings}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    isPlaylistMode
                      ? 'bg-[#00d27a] text-white shadow-md shadow-[#00d27a]/20'
                      : 'metronic-btn-secondary hover:text-[#00d27a] hover:border-[#00d27a]'
                  }`}
                  title="Play all voiceover takes sequentially"
                >
                  <ListMusic className="w-3.5 h-3.5 text-[#00d27a]" />
                  <span>{isPlaylistMode ? '▶ Playing All Takes' : '▶ Play All Recordings'}</span>
                </button>
              </div>

              {/* Playlist Active Indicator */}
              {isPlaylistMode && (
                <div className="p-2.5 rounded-lg bg-[#00d27a]/15 border border-[#00d27a]/30 flex items-center justify-between text-xs text-[#00d27a]">
                  <span className="font-bold">Playlist Mode Active: Playing all takes sequentially</span>
                  <button
                    onClick={() => setIsPlaylistMode(false)}
                    className="underline text-xs hover:text-white"
                  >
                    Stop Playlist
                  </button>
                </div>
              )}

              {/* Take Selector Tabs */}
              <div className="flex flex-wrap gap-2">
                {takes.map((take) => (
                  <button
                    key={take.id}
                    onClick={() => {
                      setIsPlaylistMode(false);
                      setActiveTakeId(take.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      activeTakeId === take.id
                        ? 'bg-[#3e97ff] text-white border-[#3e97ff]'
                        : 'bg-[#1e1f29] text-[#9a9cae] border-[#2b2d3c] hover:text-white'
                    }`}
                  >
                    Take {take.takeNumber} ({take.durationSeconds}s)
                  </button>
                ))}
              </div>

              {/* Active Take Player */}
              {activeTake && (
                <div className="p-4 rounded-xl bg-[#1e1f29] border border-[#2b2d3c] space-y-3">
                  <audio
                    ref={audioPlayerRef}
                    src={activeTake.audioUrl}
                    onTimeUpdate={() => {
                      if (audioPlayerRef.current) {
                        setAudioCurrentTime(audioPlayerRef.current.currentTime);
                        setAudioDuration(audioPlayerRef.current.duration || 0);
                      }
                    }}
                    onEnded={handleAudioEnded}
                    className="hidden"
                  />

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">
                      Take #{activeTake.takeNumber} Playback {isPlaylistMode ? '(Sequential Playlist)' : ''}
                    </span>
                    <span className="text-xs text-[#3e97ff] font-mono">
                      {Math.floor(audioCurrentTime)}s / {activeTake.durationSeconds}s
                    </span>
                  </div>

                  {/* Audio Controls */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={togglePlayAudio}
                      className="w-10 h-10 rounded-xl bg-[#3e97ff] text-white flex items-center justify-center hover:bg-[#2884ef]"
                    >
                      {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>

                    {/* Speed Controls */}
                    <div className="flex items-center space-x-1 bg-[#151620] p-1 rounded-lg border border-[#2b2d3c] text-[11px]">
                      {[1.0, 1.25, 1.5].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => {
                            setPlaybackRate(rate);
                            if (audioPlayerRef.current) {
                              audioPlayerRef.current.playbackRate = rate;
                            }
                          }}
                          className={`px-2 py-0.5 rounded font-mono font-bold ${
                            playbackRate === rate
                              ? 'bg-[#3e97ff] text-white'
                              : 'text-[#9a9cae] hover:text-white'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => downloadAudioBlob(`${script.title.replace(/\s+/g, '_')}_take${activeTake.takeNumber}.webm`, activeTake.audioBlob)}
                      className="metronic-btn-secondary py-2 px-3 text-xs flex items-center space-x-1.5 ml-auto"
                    >
                      <Download className="w-3.5 h-3.5 text-[#3e97ff]" />
                      <span>Download Audio</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
