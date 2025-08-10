"use client";

import { CalcValues, calcValues } from "@/actions/calcValues";
import { generateContent } from "@/actions/generateContent";
import { readExtract } from "@/actions/readExtract";
import { Header } from "@/components/Header";
import { TransactionsTable } from "@/components/TransactionsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExtractRecord, FinancialReport } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

const mock = {
  title: "Relatório Detalhado de Despesas Financeiras",
  summary:
    "Este relatório apresenta uma análise detalhada das despesas financeiras, totalizando R$ 3.073,34, distribuídas em diversas categorias. O objetivo é fornecer uma visão clara dos gastos e identificar áreas para otimização.",
  insights: [
    "O gasto total registrado foi de R$ 3.073,34.",
    "As três categorias com maior gasto são TRANSPORTE (R$ 657,64), ENSINO (R$ 443,63) e RESTAURANTES (R$ 451,96).",
    "Juntas, as categorias de TRANSPORTE, ENSINO e RESTAURANTES representam aproximadamente 50.1% do total das despesas.",
    "A categoria 'OUTROS' representa R$ 166,29, indicando que uma parcela dos gastos não está categorizada especificamente.",
    "As categorias com menor gasto são DROGARIA (R$ 24,80) e SUPERMERCADO (R$ 51,98).",
    "A categoria SAUDE registrou um gasto significativo de R$ 304,00.",
    "Os gastos com ENTRETENIMENTO totalizaram R$ 252,40, enquanto CULTURA representou R$ 49,00.",
    "SERVICOS representam uma fatia considerável dos gastos, com R$ 357,66.",
    "As COMPRAS totalizaram R$ 138,31, e VESTUARIO R$ 175,67.",
  ],
  recommendations: [
    "Revisar os gastos com TRANSPORTE: Dada a alta representatividade (21.4%), analisar possíveis alternativas para reduzir custos, como transporte público, caronas, ou otimização de rotas.",
    "Categorizar melhor os gastos em 'OUTROS': Para obter uma visão mais precisa dos gastos, é recomendável reavaliar e categorizar os itens sob 'OUTROS' em categorias mais específicas.",
    "Monitorar gastos em ENSINO e RESTAURANTES: Embora possam ser despesas essenciais, é prudente acompanhar de perto para identificar oportunidades de economia sem comprometer a qualidade.",
    "Considerar um orçamento para lazer: Comparar os gastos com ENTRETENIMENTO e CULTURA com o orçamento planejado para avaliar se estão alinhados com os objetivos financeiros.",
    "Analisar a frequência de compras em SUPERMERCADO e DROGARIA: Embora os valores sejam baixos, entender a frequência e o tipo de compras pode revelar padrões para otimização.",
  ],
  conclusion:
    "O relatório oferece uma base sólida para entender o comportamento de gastos. Ao focar nas categorias de maior impacto e na melhoria da categorização, é possível implementar estratégias eficazes para otimizar as despesas e alcançar uma maior saúde financeira. A análise contínua é fundamental para adaptar as estratégias conforme necessário.",
  chartData: [
    {
      label: "TRANSPORTE",
      value: 657.64,
    },
    {
      label: "ENSINO",
      value: 443.63,
    },
    {
      label: "RESTAURANTES",
      value: 451.96,
    },
    {
      label: "SERVICOS",
      value: 357.66,
    },
    {
      label: "SAUDE",
      value: 304,
    },
    {
      label: "ENTRETENIMENTO",
      value: 252.4,
    },
    {
      label: "VESTUARIO",
      value: 175.67,
    },
    {
      label: "OUTROS",
      value: 166.29,
    },
    {
      label: "COMPRAS",
      value: 138.31,
    },
    {
      label: "SUPERMERCADO",
      value: 51.98,
    },
    {
      label: "CULTURA",
      value: 49,
    },
    {
      label: "DROGARIA",
      value: 24.8,
    },
  ],
};

export default function Home() {
  const [result, setResult] = useState<ExtractRecord[]>([]);
  const [filteredResult, setFilteredResult] = useState<ExtractRecord[]>([]);
  const [filterkey, setFilterKey] = useState<string>("");
  const [chartData, setChartData] = useState<CalcValues>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [excelFormula, setExcelFormula] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [relatory, setRelatory] = useState<FinancialReport>();
  const [isRelatoryLoading, setIsRelatoryLoading] = useState<boolean>(false);
  const [isRelatoryModalOpen, setIsRelatoryModalOpen] = useState(false);

  console.log(relatory);

  async function handleAction(formData: FormData) {
    try {
      setErrorMessage(null);
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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

  const handleGenerateAIRelatory = async () => {
    try {
      setIsRelatoryLoading(true);
      const response = await generateContent(JSON.stringify(result!));
      console.log("AI Relatory", response);
      const formatedResponse = response!.replace(/```json|```/g, "").trim();
      setRelatory(JSON.parse(formatedResponse));
      setIsRelatoryModalOpen(true);
      toast.success("Relatório gerado com sucesso!");
    } catch (error) {
      console.log("Error generating AI relatory:", error);
    } finally {
      setIsRelatoryLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Dialog open={isRelatoryModalOpen} onOpenChange={setIsRelatoryModalOpen}>
        <DialogContent className="sm:max-h-[600px] sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>{relatory?.title}</DialogTitle>
            <DialogDescription>{relatory?.summary}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] w-full px-4 ">
            <div>
              <h1 className="font-bold">Insights:</h1>
              <div className="mt-2 flex flex-col gap-2">
                {relatory?.insights?.map?.((insight, index) => (
                  <span key={index} className="ml-4">
                    {insight}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <h1 className="font-bold">Recomendações:</h1>
              <div className="mt-4 flex flex-col gap-2">
                {relatory?.recommendations?.map((recommendation, index) => {
                  return (
                    <p key={index} className="ml-4">
                      {recommendation}
                    </p>
                  );
                })}
              </div>
            </div>
            <div className="mt-4">
              <h1 className="font-bold">Conclusão:</h1>
              <span className="mt-4">{relatory?.conclusion}</span>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <Header
        show={result.length > 0}
        onReset={resetResult}
        excelFormula={excelFormula}
        onCopyExcelFormula={handleCopyExcelFormula}
        onFilter={handleFilter}
        onSubmitFilterSearch={handleSubmitFilterSearch}
        data={chartData}
        filterkey={filterkey}
        onGenerateRelatory={handleGenerateAIRelatory}
        isRelatoryLoading={isRelatoryLoading}
        hasRelatory={!!relatory}
        onViewRelatory={() => setIsRelatoryModalOpen(true)}
      />

      <main className="flex flex-col gap-4  h-full  w-full ">
        {filteredResult.length > 0 ? (
          <TransactionsTable data={filteredResult} />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            {isLoading ? (
              <p>Carregando...</p>
            ) : (
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
            )}
          </div>
        )}
      </main>
    </div>
  );
}
