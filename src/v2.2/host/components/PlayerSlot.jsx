import { PersonIcon, CheckIcon } from './Icons';

/**
 * PlayerSlot
 *
 * Displays a single player's connection status.
 * Connected: green background, avatar, "READY!" label.
 * Disconnected: grey, translucent icon, "Scan to connect.." label.
 *
 * Uses the custom `ch:` variant for hover/controller-hover effects.
 */
export default function PlayerSlot(props) {
  // props.connected – boolean
  // props.name      – string e.g. "Player 1"
  // props.avatarSrc – optional image URL for connected state

  return (
    <div
      style={`
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        border-radius: 16px;
        padding: 24px;
        cursor: pointer;
        user-select: none;
        transition: all 0.2s ease;
        background: ${props.connected ? '#d4f0e2' : '#eeeeee'};
        border: 4px solid ${props.connected ? '#4dbb8a' : '#d5d5d5'};
      `}
    >
      {/* Avatar / Icon area */}
      <div
        style={`
          width: 96px;
          height: 96px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: ${props.connected ? '#a8dfc2' : '#d8d8d8'};
          ${props.connected ? 'box-shadow: inset 0 0 0 2px white;' : ''}
        `}
      >
        {props.connected && props.avatarSrc
          ? (
            <img
              src={props.avatarSrc}
              alt=""
              style="width: 100%; height: 100%; object-fit: cover;"
              draggable={false}
            />
          )
          : (
            <div style={`width: 24px; height: 24px; color: ${props.connected ? '#2d8a60' : '#b0b0b0'};`}>
              {/* <PersonIcon /> */}
            </div>
          )
        }
      </div>

      {/* Name */}
      <span
          style={`
            font-size: 24px;
            font-weight: 700;
            line-height: 1.25;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
            color: ${props.connected ? '#1a6344' : '#888'};
          `}
      >
        {props.name}
      </span>

      {/* Status */}
      {props.connected
        ? (
          <span style="font-size: 20px; font-weight: 900; color: #22a06b; letter-spacing: -0.5px;">READY!</span>
        )
        : (
          <span style="font-size: 18px; font-weight: 600; color: #aaa; text-align: center; line-height: 1.25;">
            Scan to connect..
          </span>
        )
      }
    </div>
  );
}
