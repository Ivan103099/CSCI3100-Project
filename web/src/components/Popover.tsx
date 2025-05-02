import * as Aria from "react-aria-components";

import { cn } from "@/lib/utils";

const Popover = ({ className, offset = 4, ...props }: Aria.PopoverProps) => (
	<Aria.Popover
		className={cn(
			"w-auto z-50 border border-border bg-popover text-popover-foreground",
			"rounded-md shadow-md outline-none min-w-(--trigger-width)",
			className,
		)}
		offset={offset}
		{...props}
	/>
);

export default Popover;
