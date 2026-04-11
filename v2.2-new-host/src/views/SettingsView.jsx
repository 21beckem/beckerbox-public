/**
 * SettingsView - settings panel with back button, sliders, system info footer.
 */
import { createSignal } from 'solid-js';

const VIDEO_STEPS = ['Low', 'Med', 'High', 'Ultra'];

function BackButton(props) {
  return (
    <button
      onClick={props.onClick}
      style="
        display: inline-flex; align-items: center; gap: 8px;
        padding: 6px 14px 6px 8px;
        background: rgba(0,0,0,0.06); border: none; border-radius: 10px;
        cursor: pointer; transition: background 150ms ease;
        font-family: inherit;
      "
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.12)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
    >
      <span style="
        width: 22px; height: 22px; border-radius: 50%;
        background: #cc3333; display: flex; align-items: center; justify-content: center;
        color: white; font-size: 11px; font-weight: 900; flex-shrink: 0;
      ">B</span>
      <span style="font-size: 13px; font-weight: 700; color: #1a6344;">Back</span>
    </button>
  );
}

export default function SettingsView(props) {
  const [videoQuality, setVideoQuality] = createSignal(2);
  const [audioLevel, setAudioLevel] = createSignal(75);

  const videoGrad = () => `linear-gradient(to right, #2d9a6b ${(videoQuality() / 3) * 100}%, #ddd ${(videoQuality() / 3) * 100}%)`;
  const audioGrad = () => `linear-gradient(to right, #2d9a6b ${audioLevel()}%, #ddd ${audioLevel()}%)`;

  return (
    <div style="display: flex; flex-direction: column; height: 100%; padding: 20px 32px 20px;">

      {/* ── HEADER ROW: Back + Title ── */}
      <div style="display: flex; align-items: center; gap: 12px; padding-bottom: 14px;">
        <BackButton onClick={props.onBack} />
        <h1 style="font-size: clamp(18px, 2.2vw, 26px); font-weight: 900; color: #1a6344; letter-spacing: -0.4px; margin: 0;">
          Settings
        </h1>
      </div>

      {/* ── DIVIDER ── */}
      <div style="border-top: 1px solid rgba(0,0,0,0.07);" />

      {/* ── VIDEO QUALITY ── */}
      <div style="padding: 18px 0 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div>
            <p style="font-size: 13px; font-weight: 800; color: #1a6344; margin: 0;">Video Quality</p>
            <p style="font-size: 11px; font-weight: 600; color: #7aaa90; margin: 3px 0 0;">Resolution &amp; frame rate</p>
          </div>
          <span style="font-size: 12px; font-weight: 900; padding: 4px 10px; border-radius: 8px; background: #2d9a6b; color: white;">
            {VIDEO_STEPS[videoQuality()]}
          </span>
        </div>

        <div style="position: relative;">
          <input
            type="range" min="0" max="3" step="1"
            value={videoQuality()}
            onInput={e => setVideoQuality(Number(e.target.value))}
            class="notched-slider"
            style={`width: 100%; background: ${videoGrad()};`}
          />
          {/* Step labels */}
          <div style="display: flex; justify-content: space-between; margin-top: 6px; padding: 0 2px;">
            {VIDEO_STEPS.map((label, i) => (
              <span style={`font-size: 10px; font-weight: 700; color: ${videoQuality() === i ? '#2d9a6b' : '#bbb'};`}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div style="border-top: 1px solid rgba(0,0,0,0.07);" />

      {/* ── AUDIO LEVEL ── */}
      <div style="padding: 18px 0 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div>
            <p style="font-size: 13px; font-weight: 800; color: #1a6344; margin: 0;">Audio Level</p>
            <p style="font-size: 11px; font-weight: 600; color: #7aaa90; margin: 3px 0 0;">Master volume</p>
          </div>
          <span style="font-size: 13px; font-weight: 900; color: #2d9a6b;">{audioLevel()}%</span>
        </div>

        <input
          type="range" min="0" max="100" step="1"
          value={audioLevel()}
          onInput={e => setAudioLevel(Number(e.target.value))}
          class="notched-slider"
          style={`width: 100%; background: ${audioGrad()};`}
        />

        <div style="display: flex; justify-content: space-between; margin-top: 6px;">
          <span style={`font-size: 15px; opacity: ${audioLevel() < 5 ? 1 : 0.25}; transition: opacity 150ms;`}>🔇</span>
          <span style={`font-size: 15px; opacity: ${audioLevel() >= 5 && audioLevel() < 40 ? 1 : 0.25}; transition: opacity 150ms;`}>🔈</span>
          <span style={`font-size: 15px; opacity: ${audioLevel() >= 40 && audioLevel() < 75 ? 1 : 0.25}; transition: opacity 150ms;`}>🔉</span>
          <span style={`font-size: 15px; opacity: ${audioLevel() >= 75 ? 1 : 0.25}; transition: opacity 150ms;`}>🔊</span>
        </div>
      </div>

      {/* ── SPACER ── */}
      <div style="flex: 1;" />

      {/* ── DIVIDER ── */}
      <div style="border-top: 1px solid rgba(0,0,0,0.07);" />

      {/* ── SYSTEM INFO FOOTER — only here ── */}
      <div style="display: flex; align-items: center; justify-content: center; padding-top: 14px;">
        <span style="font-size: 10px; font-weight: 600; color: #aaa; letter-spacing: 0.04em;">
          Remotes: v2.2.2 &nbsp;–&nbsp; Software: v2.2.0
        </span>
      </div>

    </div>
  );
}