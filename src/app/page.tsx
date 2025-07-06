"use client";

import { CalcValues, calcValues } from "@/actions/calcValues";
import { readExtract } from "@/actions/readExtract";
import { Header } from "@/components/Header";
import { TransactionsTable } from "@/components/TransactionsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExtractRecord } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [result, setResult] = useState<ExtractRecord[]>([]);
  const [filteredResult, setFilteredResult] = useState<ExtractRecord[]>([]);
  const [filterkey, setFilterKey] = useState<string>("");
  const [chartData, setChartData] = useState<CalcValues>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [excelFormula, setExcelFormula] = useState<string>("");

  async function handleAction(formData: FormData) {
    try {
      setErrorMessage(null);
      const data = await readExtract(formData);
      const values = await calcValues(data);

      setChartData(values);
      setResult(data);
      setFilteredResult(data);
      calcExcelFunc(data);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "message" in error) {
        setErrorMessage((error as { message: string }).message);
      } else {
        setErrorMessage("An error occurred while reading the extract.");
      }
    }
  }

  const handleFilter = (key: string) => {
    if (key === filterkey) {
      setFilterKey("");
      setFilteredResult(result);
      calcExcelFunc(result);
      return;
    }

    setFilterKey(key);
    const filtered = result.filter((item) => item["Categoria"] === key);
    calcExcelFunc(filtered);
    setFilteredResult(filtered);
  };

  const handleSubmitFilterSearch = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const filterInput = event.currentTarget.elements.namedItem(
      "filter"
    ) as HTMLInputElement | null;

    let filtered = [] as ExtractRecord[];

    if (filterInput?.value.includes("&&")) {
      const itens = filterInput.value.split("&&").map((item) => item.trim());
      filtered = result.filter(
        (item) =>
          item["Lançamento"].includes(itens[0].toUpperCase()) ||
          item["Lançamento"].includes(itens[1].toUpperCase())
      );
    } else {
      filtered = result.filter((item) =>
        item["Lançamento"].includes(filterInput?.value.toUpperCase() || "")
      );
    }

    setFilteredResult(filtered);
    calcExcelFunc(filtered);
  };

  const resetResult = () => {
    setResult([]);
    setFilteredResult([]);
    setChartData(undefined);
  };

  const calcExcelFunc = (data: ExtractRecord[]) => {
    const formula = data
      .map((item) => item["Valor"].replace(".", ",").replace("R$", "").trim())
      .join("+");

    setExcelFormula(formula);
  };

  const handleCopyExcelFormula = async () => {
    try {
      await navigator.clipboard.writeText(`=(${excelFormula})`);
      toast.success("Fórmula copiada para a área de transferência!");
    } catch (error) {
      console.error("Error copying Excel formula:", error);
      toast.error("Erro ao copiar a fórmula para a área de transferência.");
    }
  };

  return (
    <div className="flex flex-col h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Header
        show={result.length > 0}
        onReset={resetResult}
        excelFormula={excelFormula}
        onCopyExcelFormula={handleCopyExcelFormula}
        onFilter={handleFilter}
        onSubmitFilterSearch={handleSubmitFilterSearch}
        data={chartData}
        filterkey={filterkey}
      />

      <main className="flex flex-col gap-4  h-full  w-full ">
        {filteredResult.length > 0 ? (
          <TransactionsTable data={filteredResult} />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <form
              action={handleAction}
              className="flex flex-col  gap-4  items-center justify-center"
            >
              <Label htmlFor="extract-file">
                Selecione seu arquivo de extrato
              </Label>
              <Input
                id="extract-file"
                type="file"
                name="extract-file"
                className="cursor-pointer"
                accept=".csv, .xlsx, .xls"
              />
              <Button type="submit" className="cursor-pointer w-full">
                Ler
              </Button>
              <p>
                Clique{" "}
                <a
                  href="modelo_planilha.csv"
                  download
                  className="text-blue-500 hover:underline"
                >
                  aqui
                </a>{" "}
                para baixar o modelo de planilha
              </p>
              {errorMessage && (
                <span className="text-red-500 mt-2 text-center">
                  {errorMessage}
                </span>
              )}
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
