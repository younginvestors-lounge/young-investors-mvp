import { describe, expect, it } from "vitest";
import {
  createTerminalReceipt,
  isPublicLedgerVisible,
  PUBLIC_LEDGER_RECONCILIATION_DELAY_MS,
  withTerminalReceipt,
  type TerminalEventRecord,
} from "./transactionTerminal";

const CREATED_AT = Date.UTC(2026, 6, 2, 10, 0, 0);

describe("transaction terminal receipts", () => {
  it("creates a three-face mock accounting receipt", () => {
    const receipt = createTerminalReceipt({
      id: "vote-1",
      kind: "vote_cast",
      ticker: "NPN.JO",
      side: "FOR",
      amount: null,
      status: "approved",
      createdAt: CREATED_AT,
    });

    expect(receipt.statementType).toBe("MOCK_TRIPLE_LEDGER_ACCOUNTING_RECEIPT");
    expect(receipt.immutable).toBe(true);
    expect(receipt.concealedKitchenRef).toBe("KITCHEN_IDENTITY_CONCEALED");
    expect(receipt.faces.personalChef.visibility).toBe("private");
    expect(receipt.faces.kitchen.visibility).toBe("concealed");
    expect(receipt.faces.publicLedger.visibility).toBe("public");
    expect(receipt.faces.publicLedger.concealedFields).toContain("chef identity");
    expect(receipt.faces.publicLedger.concealedFields).toContain("Kitchen identity");
    expect(receipt.layers.map((line) => line.layer)).toEqual(["personal_vault", "kitchen_vault", "public_terminal"]);
  });

  it("delays the public ledger face by five minutes for reconciliation", () => {
    const event = withTerminalReceipt({
      id: "recipe-1",
      kind: "recipe_submitted",
      title: "Kitchen recipe receipt",
      line: "BUY NPN.JO sent to concealed Kitchen vote",
      ticker: "NPN.JO",
      side: "BUY",
      amount: 1200,
      status: "pending",
      createdAt: CREATED_AT,
      mode: "MOCK_MVP_PAPER_TRADING_ONLY",
    } satisfies TerminalEventRecord);

    expect(event.receipt.publicVisibleAt).toBe(CREATED_AT + PUBLIC_LEDGER_RECONCILIATION_DELAY_MS);
    expect(isPublicLedgerVisible(event, CREATED_AT + PUBLIC_LEDGER_RECONCILIATION_DELAY_MS - 1)).toBe(false);
    expect(isPublicLedgerVisible(event, CREATED_AT + PUBLIC_LEDGER_RECONCILIATION_DELAY_MS)).toBe(true);
  });
});
