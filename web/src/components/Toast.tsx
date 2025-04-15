import * as Aria from "react-aria-components";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const variants = cva(
	[
		"relative flex items-center justify-between w-full p-5 rounded-md shadow-lg",
		"overflow-hidden pointer-events-auto transition-all",
		"border border-border bg-background text-foreground",
	],
	{
		variants: {
			variant: {
				default: "",
				destructive: "border-0 border-t-4 border-t-destructive",
				success: "border-0 border-t-4 border-t-emerald-500",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

type ToastFields = {
	title: string;
	description: string;
	variant?: VariantProps<typeof variants>["variant"];
};

export const toasts = new Aria.UNSTABLE_ToastQueue<ToastFields>();

const Toast = ({
	className,
	...props
}: Omit<Aria.ToastProps<ToastFields>, "toast">) => (
	<Aria.UNSTABLE_ToastRegion
		queue={toasts}
		className={cn(
			"fixed top-0 z-[100] flex flex-col-reverse max-h-screen w-full p-4 gap-2",
			"sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
		)}
	>
		{({ toast }) => (
			<Aria.UNSTABLE_Toast
				toast={toast}
				className={cn(
					variants({
						variant: toast.content.variant,
					}),
					className,
				)}
				{...props}
			>
				<Aria.UNSTABLE_ToastContent className="flex flex-col gap-1">
					<Aria.Text slot="title" className="font-semibold">
						{toast.content.title}
					</Aria.Text>
					<Aria.Text slot="description" className="text-sm">
						{toast.content.description}
					</Aria.Text>
				</Aria.UNSTABLE_ToastContent>
				<Aria.Button
					slot="close"
					className={cn(
						"absolute right-2 top-2 m-1 text-foreground/50 transition-opacity",
						"hover:text-foreground hover:opacity-100 cursor-pointer",
					)}
				>
					<X className="size-4" />
				</Aria.Button>
			</Aria.UNSTABLE_Toast>
		)}
	</Aria.UNSTABLE_ToastRegion>
);

export default Toast;
