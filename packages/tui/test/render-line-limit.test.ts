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

class CountingLinesComponent extends LinesComponent {
	renderCalls = 0;

	override render(width: number): string[] {
		this.renderCalls++;
		return super.render(width);
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

	it("does not render older siblings once the configured tail is filled", () => {
		const terminal = new VirtualTerminal(40, 2);
		const ui = new TUI(terminal);
		const oldTranscript = new CountingLinesComponent(["old-0", "old-1", "old-2"]);
		const recentTranscript = new CountingLinesComponent(["recent-0", "recent-1", "recent-2"]);

		ui.setMaxRenderedLines(3);
		ui.addChild(oldTranscript);
		ui.addChild(recentTranscript);
		(ui as unknown as { doRender(): void }).doRender();

		assert.equal(oldTranscript.renderCalls, 0);
		assert.equal(recentTranscript.renderCalls, 1);
	});
});
