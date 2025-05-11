import React from "react";
import EmojiPicker from "@/components/EmojiPicker";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("EmojiPicker", () => {
    it("renders EmojiPicker", () => {
        const emojiValue = { emoji: "😀", label: "Grinning Face" };
        render(<EmojiPicker value={emojiValue} />);

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(screen.getByText('😀')).toBeInTheDocument();
        expect(screen.getByText('Grinning Face')).toBeInTheDocument();
    });
});