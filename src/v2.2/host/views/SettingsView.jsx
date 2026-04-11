/**
 * SettingsView - settings panel with back button, sliders, system info footer.
 *
 * Props:
 *   - videoQuality: Solid signal (0–3) for video quality selection
 *   - audioLevel: Solid signal (0–100) for audio volume
 *   - onVideoQualityChange: (newValue: 0–3) => void
 *   - onAudioLevelChange: (newValue: 0–100) => void
 *   - remoteVersions: { remote: string, software: string } or null
 *   - onBack: () => void
 */
import { createSignal, Show } from 'solid-js';
import { BackButton } from '../components/BackButton';

const VIDEO_STEPS = ['Low', 'Med', 'High', 'Ultra'];

export default function SettingsView(props) {
  // Get signal values (call as functions)
  const videoQuality = () => props.videoQuality?.() ?? 2;
  const audioLevel = () => props.audioLevel?.() ?? 75;

  const videoGrad = () => `linear-gradient(to right, #2d9a6b ${(videoQuality() / 3) * 100}%, #ddd ${(videoQuality() / 3) * 100}%)`;
  const audioGrad = () => `linear-gradient(to right, #2d9a6b ${audioLevel()}%, #ddd ${audioLevel()}%)`;

  return (
    <div style="display: flex; flex-direction: column; height: 100%; padding: 20px 32px 20px;">

      {/* ── HEADER ROW: Back + Title ── */}
      <div style="display: flex; align-items: center; gap: 16px; padding-bottom: 20px;">
        <BackButton onClick={props.onBack} />
        <h1 style="font-size: clamp(28px, 3.5vw, 40px); font-weight: 900; color: #1a6344; letter-spacing: -0.4px; margin: 0;">
          Settings
        </h1>
      </div>

      {/* ── DIVIDER ── */}
      <div style="border-top: 2px solid rgba(0,0,0,0.1);" />

      {/* ── VIDEO QUALITY ── */}
      <div style="padding: 28px 0 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
          <div>
            <p style="font-size: 20px; font-weight: 800; color: #1a6344; margin: 0;">Video Quality</p>
            <p style="font-size: 16px; font-weight: 600; color: #7aaa90; margin: 6px 0 0;">Resolution &amp; frame rate</p>
          </div>
          <span style="font-size: 18px; font-weight: 900; padding: 8px 16px; border-radius: 12px; background: #2d9a6b; color: white;">
            {VIDEO_STEPS[videoQuality()]}
          </span>
        </div>

        <div style="position: relative;">
          <input
            type="range" min="0" max="3" step="1"
            value={videoQuality()}
            onInput={e => props.onVideoQualityChange?.(Number(e.target.value))}
            class="notched-slider"
            style={`width: 100%; background: ${videoGrad()};`}
          />
          {/* Step labels */}
          <div style="display: flex; justify-content: space-between; margin-top: 10px; padding: 0 2px;">
            {VIDEO_STEPS.map((label, i) => (
              <span style={`font-size: 14px; font-weight: 700; color: ${videoQuality() === i ? '#2d9a6b' : '#bbb'};`}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div style="border-top: 2px solid rgba(0,0,0,0.1);" />

      {/* ── AUDIO LEVEL ── */}
      <div style="padding: 28px 0 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
          <div>
            <p style="font-size: 20px; font-weight: 800; color: #1a6344; margin: 0;">Audio Level</p>
            <p style="font-size: 16px; font-weight: 600; color: #7aaa90; margin: 6px 0 0;">Master volume</p>
          </div>
          <span style="font-size: 20px; font-weight: 900; color: #2d9a6b;">{audioLevel()}%</span>
        </div>

        <input
          type="range" min="0" max="100" step="1"
          value={audioLevel()}
          onInput={e => props.onAudioLevelChange?.(Number(e.target.value))}
          class="notched-slider"
          style={`width: 100%; background: ${audioGrad()};`}
        />

        <div style="display: flex; justify-content: space-between; margin-top: 10px;">
          <span style={`font-size: 28px; opacity: ${audioLevel() < 5 ? 1 : 0.25}; transition: opacity 150ms;`}>🔇</span>
          <span style={`font-size: 28px; opacity: ${audioLevel() >= 5 && audioLevel() < 40 ? 1 : 0.25}; transition: opacity 150ms;`}>🔈</span>
          <span style={`font-size: 28px; opacity: ${audioLevel() >= 40 && audioLevel() < 75 ? 1 : 0.25}; transition: opacity 150ms;`}>🔉</span>
          <span style={`font-size: 28px; opacity: ${audioLevel() >= 75 ? 1 : 0.25}; transition: opacity 150ms;`}>🔊</span>
        </div>
      </div>

      {/* ── SPACER ── */}
      <div style="flex: 1;" />

      {/* ── DIVIDER ── */}
      <div style="border-top: 2px solid rgba(0,0,0,0.1);" />

      {/* ── SYSTEM INFO FOOTER ── */}
      <div style="display: flex; align-items: center; justify-content: center; padding-top: 14px;">
        <Show 
          when={props.remoteVersions} 
          fallback={
            <span style="font-size: 14px; font-weight: 600; color: #aaa; letter-spacing: 0.04em;">
              Remotes: — &nbsp;–&nbsp; Software: —
            </span>
          }
        >
          <span style="font-size: 14px; font-weight: 600; color: #aaa; letter-spacing: 0.04em;">
            Remotes: {props.remoteVersions?.remote || '—'} &nbsp;–&nbsp; Software: {props.remoteVersions?.software || '—'}
          </span>
        </Show>
      </div>

    </div>
  );
}