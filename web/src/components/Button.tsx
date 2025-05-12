import * as Aria from "react-aria-components";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const variants = cva(
	[
		"inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium whitespace-nowrap ring-offset-background transition-colors cursor-pointer",
		/* Disabled */
		"disabled:pointer-events-none disabled:opacity-50",
		/* Focus Visible */
		"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
		/* Resets */
		"focus-visible:outline-none",
	],
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				outline:
					"border border-input bg-background hover:bg-accent hover:text-accent-foreground",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost:
					"text-muted-foreground hover:bg-accent hover:text-accent-foreground",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 rounded-md px-3",
				lg: "h-11 rounded-md px-8",
				icon: "size-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

const Button = ({
	className,
	variant,
	size,
	...props
}: Aria.ButtonProps & VariantProps<typeof variants>) => (
	<Aria.Button
		className={cn(
			variants({
				variant,
				size,
			}),
			className,
		)}
		{...props}
	/>
);

Button.variants = variants;

export default Button;
