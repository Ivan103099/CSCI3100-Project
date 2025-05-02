import * as Aria from "react-aria-components";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Modal = ({
	close = true,
	children,
	className,
	...props
}: Omit<React.ComponentProps<typeof Aria.Modal>, "children"> & {
	close?: boolean;
	children?: Aria.DialogProps["children"];
}) => (
	<Aria.ModalOverlay
		isDismissable
		className={cn(
			"fixed inset-0 z-50 bg-black/80 duration-200",
			"entering:opacity-50 exiting:opacity-0",
		)}
	>
		<Aria.Modal
			className={cn(
				"fixed left-[50vw] top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 duration-200",
				"w-full max-w-lg p-6 border border-border bg-background shadow-lg sm:rounded-lg md:w-full",
				className,
			)}
			{...props}
		>
			<Aria.Dialog className={cn("grid h-full gap-4 outline-none")}>
				{Aria.composeRenderProps(children, (children, { close: _close }) => (
					<>
						{children}
						{close && (
							<Aria.Button
								onPress={_close}
								className={cn(
									"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background",
									"transition-opacity hover:opacity-100 cursor-pointer disabled:pointer-events-none",
								)}
							>
								<X className="size-4" />
								<span className="sr-only">Close</span>
							</Aria.Button>
						)}
					</>
				))}
			</Aria.Dialog>
		</Aria.Modal>
	</Aria.ModalOverlay>
);

Modal.Trigger = Aria.DialogTrigger;

Modal.Header = ({ className, ...props }: React.ComponentProps<"div">) => (
	<div
		className={cn(
			"flex flex-col space-y-1.5 text-center sm:text-left",
			className,
		)}
		{...props}
	/>
);

Modal.Footer = ({ className, ...props }: React.ComponentProps<"div">) => (
	<div
		className={cn(
			"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
			className,
		)}
		{...props}
	/>
);

Modal.Title = ({ className, ...props }: Aria.HeadingProps) => (
	<Aria.Heading
		slot="title"
		className={cn(
			"text-xl font-semibold leading-none tracking-tight",
			className,
		)}
		{...props}
	/>
);

Modal.Description = ({ className, ...props }: React.ComponentProps<"p">) => (
	<p
		className={cn(
			"flex flex-col space-y-1.5 text-center sm:text-left",
			className,
		)}
		{...props}
	/>
);

export default Modal;
