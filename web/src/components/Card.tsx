import { cn } from "@/lib/utils";

const Card = ({ className, ...props }: React.ComponentProps<"div">) => (
	<div
		className={cn(
			"rounded-lg shadow-sm border border-border bg-card text-card-foreground",
			className,
		)}
		{...props}
	/>
);

Card.Header = ({ className, ...props }: React.ComponentProps<"div">) => (
	<div className={cn("flex flex-col space-y-1.5 p-5", className)} {...props} />
);

Card.Title = ({ className, ...props }: React.ComponentProps<"div">) => (
	<div
		className={cn(
			"text-2xl font-semibold leading-none tracking-tight",
			className,
		)}
		{...props}
	/>
);

Card.Description = ({ className, ...props }: React.ComponentProps<"div">) => (
	<div className={cn("text-sm text-muted-foreground", className)} {...props} />
);

Card.Content = ({ className, ...props }: React.ComponentProps<"div">) => (
	<div className={cn("p-5 pt-0", className)} {...props} />
);

Card.Footer = ({ className, ...props }: React.ComponentProps<"div">) => (
	<div className={cn("flex items-center p-5 pt-0", className)} {...props} />
);

export default Card;
