export function BackButton(props) {
  return (
    <button
      class="pointer-clickable"
      onClick={props.onClick}
      style="
        display: inline-flex; align-items: center; gap: 14px;
        padding: 12px 24px 12px 14px;
        background: rgba(0,0,0,0.06); border: 2px solid rgba(0,0,0,0.1); border-radius: 16px;
        cursor: pointer; transition: background 150ms ease;
        font-family: inherit; font-size: 16px;
      "
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.12)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
    >
      <span style="
        width: 38px; height: 38px; border-radius: 50%;
        background: #cc3333; display: flex; align-items: center; justify-content: center;
        color: white; font-size: 18px; font-weight: 900; flex-shrink: 0;
      ">B</span>
      <span style="font-size: 18px; font-weight: 700; color: #1a6344;">Back</span>
    </button>
  );
}