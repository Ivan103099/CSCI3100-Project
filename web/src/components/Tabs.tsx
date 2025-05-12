import * as Aria from "react-aria-components";

import { cn } from "@/lib/utils";

const Tabs = ({ className, ...props }: Aria.TabsProps) => (
	<Aria.Tabs
		className={cn("group flex flex-col gap-2", className)}
		{...props}
	/>
);

Tabs.Nav = <T extends object>({
	className,
	...props
}: Aria.TabListProps<T>) => (
	<Aria.TabList
		className={cn(
			"inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
			className,
		)}
		{...props}
	/>
);

Tabs.NavItem = ({ className, ...props }: Aria.TabProps) => (
	<Aria.Tab
		className={cn(
			"inline-flex cursor-pointer justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium outline-none ring-offset-background transition-all",
			"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			"disabled:pointer-events-none disabled:opacity-50",
			"selected:bg-background selected:text-foreground selected:shadow-sm ",
			className,
		)}
		{...props}
	/>
);

Tabs.Content = ({ className, ...props }: Aria.TabPanelProps) => (
	<Aria.TabPanel
		className={cn(
			"mt-2 ring-offset-background",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			className,
		)}
		{...props}
	/>
);

export default Tabs;
