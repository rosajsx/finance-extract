import { CalcValues } from "@/actions/calcValues";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import clsx from "clsx";
import { ArrowLeft, Copy, Sheet } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface HeaderProps {
  show?: boolean;
  onReset: () => void;
  excelFormula: string;
  onCopyExcelFormula: () => void;
  onFilter: (filter: string) => void;
  onSubmitFilterSearch: (e: React.FormEvent<HTMLFormElement>) => void;
  data?: CalcValues;
  filterkey: string;
}

export const Header = ({
  show,
  data,
  onReset,
  onCopyExcelFormula,
  excelFormula,
  filterkey,
  onFilter,
  onSubmitFilterSearch,
}: HeaderProps) => {
  return (
    <header className="flex flex-col gap-4  w-full ">
      {show && (
        <>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onReset}
              className="cursor-pointer self-start"
            >
              <ArrowLeft /> Voltar
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="cursor-pointer self-start">
                  <Sheet /> Gerar formula Excel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Formula Excel</DialogTitle>
                </DialogHeader>
                <DialogDescription className="flex flex-col gap-2">
                  <span className="rounded-md border flex items-center p-4 gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className="cursor-pointer"
                          onClick={onCopyExcelFormula}
                        >
                          <Copy />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copiar fórmula do Excel</TooltipContent>
                    </Tooltip>
                    <span className="w-sm py-3  whitespace-nowrap overflow-auto ">
                      <span> =({excelFormula})</span>
                    </span>
                  </span>
                  <Button
                    className="cursor-pointer"
                    onClick={onCopyExcelFormula}
                  >
                    Copiar formula
                  </Button>
                </DialogDescription>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-wrap gap-4">
            {Object.values(data!).map((item) => (
              <Tooltip key={item.label}>
                <TooltipTrigger className="flex-1 ">
                  <Card
                    className={clsx(
                      "rounded-xl flex-1 cursor-pointer transition-all",
                      item.label !== "Total" && " hover:ring-2 ring-green-700",
                      item.label === filterkey &&
                        item.label !== "Total" &&
                        "ring-2 ring-green-700"
                    )}
                    onClick={() => {
                      if (item.label !== "Total") {
                        onFilter(item.label);
                      }
                    }}
                  >
                    <CardContent className="flex flex-col gap-2">
                      <h3 className="text-base">{item.label}</h3>

                      <h2>
                        {item.value.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </h2>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <span>
                    {item.label === "Total"
                      ? "Total de lançamentos"
                      : `Clique para filtrar na categoria ${item.label}`}
                  </span>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className="cursor-pointer">
                Mais filtros
              </AccordionTrigger>
              <AccordionContent>
                <form
                  className="flex flex-col gap-2"
                  onSubmit={onSubmitFilterSearch}
                >
                  <Label htmlFor="filter">Nome</Label>
                  <div className="flex gap-2">
                    <Input
                      id="filter"
                      type="text"
                      placeholder="Digite um nome para filtrar"
                      className="w-xs"
                    />
                    <Button type="submit" className="cursor-pointer">
                      Filtrar
                    </Button>
                  </div>
                </form>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      )}
    </header>
  );
};
