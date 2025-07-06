"use server";

import { ExtractRecord } from "@/types";

export type Item = {
  label: string;
  value: number;
};

export interface CalcValues {
  [key: string]: Item;
}

export async function calcValues(data: ExtractRecord[]) {
  "use server";

  const result = data.reduce(
    (acc, record) => {
      if (
        record["Lançamento"].includes("PAGAMENTO") ||
        record["Lançamento"].includes("AMORTIZACAO") ||
        record["Lançamento"].includes("PAGTO DEBITO AUTOMATICO")
      ) {
        console.log("a");
        return acc;
      }

      const value = parseFloat(
        record.Valor.replace("R$", "").replace(".", "").replace(",", ".").trim()
      );

      acc.total.value += isNaN(value) ? 0 : value;

      if (!acc[record.Categoria]) {
        acc[record.Categoria] = {
          label: record.Categoria,
          value,
        };
      } else {
        acc[record.Categoria].label = record.Categoria;
        acc[record.Categoria].value += value;
      }

      return acc;
    },
    {
      total: { label: "Total", value: 0 },
    } as CalcValues
  );

  return result;
}
