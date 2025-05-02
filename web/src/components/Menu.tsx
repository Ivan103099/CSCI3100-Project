import * as Aria from "react-aria-components";

import { cn } from "@/lib/utils";

import Popover from "@/components/Popover";

const Menu = <T extends object>({ className, ...props }: Aria.MenuProps<T>) => (
	<Popover>
		<Aria.Menu
			className={cn(
				"max-h-[inherit] overflow-auto rounded-md p-1 outline-0",
				className,
			)}
			{...props}
		/>
	</Popover>
);

Menu.Trigger = Aria.MenuTrigger;

Menu.Item = ({ children, className, ...props }: Aria.MenuItemProps) => (
	<Aria.MenuItem
		className={cn(
			"relative flex items-center gap-2 px-2 py-1.5",
			"text-sm rounded-sm select-none outline-none transition-colors",
			props.onAction &&
				"focus:bg-accent focus:text-accent-foreground cursor-pointer",
			className,
		)}
		{...props}
	>
		{children}
	</Aria.MenuItem>
);

Menu.Separator = ({ className, ...props }: Aria.SeparatorProps) => (
	<Aria.Separator
		className={cn("-mx-1 my-1 h-px bg-muted", className)}
		{...props}
	/>
);

export default Menu;
