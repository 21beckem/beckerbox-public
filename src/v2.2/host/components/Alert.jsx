import { For, Show } from 'solid-js';
import Button from './Button';
import TicketWrapper from './TicketWrapper';

export default function Alert(props) {
	const buttons = () => props.buttons ?? [];
	const body = () => props.message ?? props.children;

	return (
		<Show when={props.open !== false}>
			<div
				style="
					position: fixed;
					inset: 0;
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 4vh 4vw;
					background: rgba(0,0,0,0.62);
					backdrop-filter: blur(10px);
					-webkit-backdrop-filter: blur(10px);
					z-index: 200;
				"
			>
				<div style="position: relative; width: min(92vw, 1280px); height: min(88vh, 900px);">
					<TicketWrapper notchSide="none" OverlayOpen={true}>
						<div style="display: flex; flex-direction: column; height: 93%; padding: clamp(22px, 3vw, 40px);">
							<div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; padding-bottom: 18px;">
								<div style="min-width: 0;">
									<p style="margin: 0 0 8px; font-size: 14px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #7aaa90;">
										Alert
									</p>
									<h1 style="margin: 0; font-size: 6vw; line-height: 1; font-weight: 900; color: #1a6344; letter-spacing: -0.04em;">
										{props.title}
									</h1>
								</div>
							</div>

							<div style="border-top: 2px solid rgba(0,0,0,0.1);" />

							<div style="flex: 1; overflow: auto; padding: 28px 4px 18px;">
								<div style="font-size: 3.2vw; font-weight: 600; line-height: 1.45; color: #579172; white-space: pre-wrap;">
									<Show when={body()} fallback={<span />}>{body()}</Show>
								</div>
							</div>

							<div style="border-top: 2px solid rgba(0,0,0,0.1);" />

							<div style="display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 14px; padding-top: 20px;">
								<Show
									when={buttons().length > 0}
									fallback={
										<Show when={props.onClose}>
											<Button onClick={props.onClose} mega={true}>Close</Button>
										</Show>
									}
								>
									<For each={buttons()}>
										{(button) => (
											<Button onClick={button.onClick} mega={true}>
												{button.label ?? button.children}
											</Button>
										)}
									</For>
								</Show>
							</div>
						</div>
					</TicketWrapper>
				</div>
			</div>
		</Show>
	);
}
