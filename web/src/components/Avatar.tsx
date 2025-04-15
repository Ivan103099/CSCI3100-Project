import { cn } from "@/lib/utils";

const Avatar = ({
	children,
	className,
	...props
}: React.ComponentProps<"div">) => (
	<div
		className={cn(
			"flex justify-center items-center rounded-full h-9 w-9 bg-primary/10 select-none",
			className,
		)}
		{...props}
	>
		{children}
	</div>
);

export default Avatar;
