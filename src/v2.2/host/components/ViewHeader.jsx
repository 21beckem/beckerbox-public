import BackButton from "./BackButton";

export default function ViewHeader(props) {
    return (
        <div style="display: flex; align-items: center; gap: 16px; padding-bottom: 20px;">
            <BackButton onClick={props.onBack} />
            <h1 style="font-size: clamp(28px, 3.5vw, 40px); font-weight: 900; color: #1a6344; letter-spacing: -0.4px; margin: 0;">
                {props.children}
            </h1>
        </div>
    );
}