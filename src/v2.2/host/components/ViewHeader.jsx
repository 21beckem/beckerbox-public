import BackButton from "./BackButton";
import Button from "./Button";
import { Show, For } from "solid-js";

export default function ViewHeader(props) {
    return (
        <div style="display: flex; align-items: center; gap: 16px; padding-bottom: 20px;">
            <BackButton onClick={props.onBack} />
            <h1 style="font-size: clamp(28px, 3.5vw, 40px); font-weight: 900; color: #1a6344; letter-spacing: -0.4px; margin: 0;">
                {props.children}
            </h1>
            <Show when={props.actions}>
                <div style="margin-left: auto; display: flex; gap: 12px;">
                    <For each={props.actions}>
                        {(action) => (
                            <Button onClick={action.onClick} mega={action.mega}>
                                {action.label}
                            </Button>
                        )}
                    </For>
                </div>
            </Show>
        </div>
    );
}