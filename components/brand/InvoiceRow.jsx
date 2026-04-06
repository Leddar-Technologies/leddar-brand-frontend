import Badge from "../ui/Badge";
import Button from "../ui/Button";

export default function InvoiceRow({ invoice }) {
  return (
    <tr className="border-b border-[#EEE4DB]">
      <td className="px-3 py-3 text-sm">{invoice.orderId}</td>
      <td className="px-3 py-3 text-sm">{invoice.product}</td>
      <td className="px-3 py-3 text-sm">{invoice.date}</td>
      <td className="px-3 py-3 text-sm">{invoice.amount}</td>
      <td className="px-3 py-3 text-sm">{invoice.vat}</td>
      <td className="px-3 py-3 text-sm font-semibold">{invoice.total}</td>
      <td className="px-3 py-3 text-sm">
        <Badge status={invoice.status} />
      </td>
      <td className="px-3 py-3 text-sm">
        <Button
          variant="outline"
          className="mr-2 mb-2 px-3 py-2 text-xs md:mb-0"
        >
          Download PDF
        </Button>
      </td>
    </tr>
  );
}
