import assert from "node:assert";
import { describe, it } from "node:test";
import type { Component } from "../src/tui.ts";
import { TUI } from "../src/tui.ts";
import { VirtualTerminal } from "./virtual-terminal.ts";

class LinesComponent implements Component {
	private lines: string[];

	constructor(lines: string[]) {
		this.lines = lines;
	}

	invalidate(): void {}

	render(_width: number): string[] {
		return this.lines;
	}
}

describe("TUI rendered line cap", () => {
	it("keeps the latest rendered lines when a max render line limit is configured", () => {
		const terminal = new VirtualTerminal(40, 2);
		const ui = new TUI(terminal);
		const lines = Array.from({ length: 10 }, (_, index) => `line-${index}`);

		ui.setMaxRenderedLines(3);
		ui.addChild(new LinesComponent(lines));
		(ui as unknown as { doRender(): void }).doRender();

		const previousLines = (ui as unknown as { previousLines: string[] }).previousLines;
		assert.equal(previousLines.length, 3);
		assert.ok(previousLines[0].includes("line-7"));
		assert.ok(previousLines[1].includes("line-8"));
		assert.ok(previousLines[2].includes("line-9"));
	});
});
