import React from "react";
import * as Aria from "react-aria-components";
import {
	EmojiPicker as _EmojiPicker,
	type EmojiPickerRootProps,
} from "frimousse";

import { cn } from "@/lib/utils";

import Button from "./Button";
import Popover from "./Popover";

const EmojiPicker = ({
	value,
	onEmojiSelect,
	...props
}: EmojiPickerRootProps & { value?: { emoji: string; label: string } }) => {
	const [selected, setSelected] = React.useState(value);
	return (
		<Aria.DialogTrigger>
			<Button variant="outline" className="font-normal outline-none">
				<span className="text-2xl">{selected?.emoji}</span>
				<span className="text-xs overflow-hidden text-ellipsis">
					{selected?.label}
				</span>
			</Button>
			<Popover className="min-w-(--trigger-width)">
				<Aria.Dialog className="outline-none">
					<_EmojiPicker.Root
						columns={8}
						onEmojiSelect={(emoji) => {
							setSelected(emoji);
							onEmojiSelect?.(emoji);
						}}
						className="isolate flex flex-col h-80 gap-2"
						{...props}
					>
						<_EmojiPicker.Search
							className={cn(
								"flex h-7 p-2 mx-2 mt-2 rounded-md border border-input text-xs bg-background ring-offset-background placeholder:text-muted-foreground",
								"focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1",
							)}
						/>
						<_EmojiPicker.Viewport className="px-2 pb-1">
							<_EmojiPicker.List
								components={{
									CategoryHeader: ({ category, ...props }) => (
										<div className="py-[0.1px] bg-transparent" {...props} />
									),
									Row: ({ children, ...props }) => (
										<div {...props}>{children}</div>
									),
									Emoji: ({ emoji, ...props }) => (
										<button
											className={cn(
												Button.variants({ variant: "ghost" }),
												"size-9 text-xl",
												emoji.label === selected?.label &&
													"border-2 border-border",
											)}
											{...props}
										>
											{emoji.emoji}
										</button>
									),
								}}
							/>
						</_EmojiPicker.Viewport>
					</_EmojiPicker.Root>
				</Aria.Dialog>
			</Popover>
		</Aria.DialogTrigger>
	);
};

export default EmojiPicker;
