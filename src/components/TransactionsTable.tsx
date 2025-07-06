import { ExtractRecord } from "@/types";
import clsx from "clsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface TransactionsTableProps {
  data: ExtractRecord[];
}

export const TransactionsTable = ({ data }: TransactionsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Data</TableHead>
          <TableHead className="text-center">Nome</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => {
          const isPayment =
            item?.["Lançamento"]?.includes("PAGAMENTO") ||
            item?.["Lançamento"]?.includes("AMORTIZACAO") ||
            item?.["Lançamento"]?.includes("PAGTO DEBITO AUTOMATICO");

          return (
            <TableRow key={`${item?.["Lançamento"]}-${index}`}>
              <TableCell>{item?.["Data"]} </TableCell>
              <TableCell className="text-center">
                {item?.["Lançamento"]}{" "}
              </TableCell>
              <TableCell>{item?.["Categoria"]}</TableCell>
              <TableCell
                className={clsx("text-right", isPayment && "text-green-500")}
              >
                {isPayment && "+"}
                {item?.["Valor"]}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
