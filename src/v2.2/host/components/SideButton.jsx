/**
 * SideButton - Fixed frosted-glass pill tab, attached to left/right screen edge.
 * No clip-path — just a rounded rectangle pill that extends from the screen edge.
 */
export default function SideButton(props) {
  const isLeft = props.side === 'left';

  return (
    <button
      class="pointer-clickable"
      onClick={props.onClick}
      style={`
        display: flex;
        align-items: center;
        justify-content: center;
        width: 90px;
        height: 140px;
        background: ${props.isActive ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.26)'};
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 3px solid rgba(255,255,255,0.45);
        border-${isLeft ? 'left' : 'right'}: none;
        border-radius: ${isLeft ? '0 30px 30px 0' : '30px 0 0 30px'};
        color: ${props.isActive ? '#1a6344' : '#2e5e42'};
        cursor: pointer;
        transition: background 200ms ease, transform 150ms ease;
        outline: none;
        box-shadow: ${isLeft ? '3px' : '-3px'} 0 16px rgba(0,0,0,0.18);
      `}
      classList={{ hover: false }}
      onMouseEnter={e => e.currentTarget.style.background = props.isActive ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.42)'}
      onMouseLeave={e => e.currentTarget.style.background = props.isActive ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.26)'}
    >
      <div style="width: 48px; height: 48px;">
        {props.children}
      </div>
    </button>
  );
}