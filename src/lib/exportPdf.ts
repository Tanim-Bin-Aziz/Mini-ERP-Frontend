import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Sale } from '@/types';

export const exportTableToPdf = ({
  filename,
  title,
  head,
  body,
}: {
  filename: string;
  title: string;
  head: string[];
  body: (string | number)[][];
}) => {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [head],
    body,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [43, 58, 103] }, // brand indigo
    alternateRowStyles: { fillColor: [250, 250, 248] },
  });

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
};

// Bonus: printable invoice PDF for a single sale
export const exportSaleInvoicePdf = (sale: Sale) => {
  const doc = new jsPDF();
  const customerName = typeof sale.customer === 'string' ? sale.customer : sale.customer.name;
  const customerPhone = typeof sale.customer === 'string' ? '' : sale.customer.phone;

  doc.setFontSize(16);
  doc.setTextColor(43, 58, 103);
  doc.text('Mini ERP — Sales Invoice', 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text(`Invoice: ${sale.invoiceNumber}`, 14, 28);
  doc.text(`Date: ${new Date(sale.createdAt).toLocaleString()}`, 14, 34);
  doc.text(`Customer: ${customerName}${customerPhone ? ` (${customerPhone})` : ''}`, 14, 40);
  doc.text(`Payment: ${sale.paymentMethod}  |  Status: ${sale.status}`, 14, 46);

  autoTable(doc, {
    startY: 54,
    head: [['Product', 'SKU', 'Qty', 'Unit Price', 'Line Total']],
    body: sale.items.map((item) => [
      item.name,
      item.sku,
      item.quantity,
      `৳${item.price.toLocaleString()}`,
      `৳${item.lineTotal.toLocaleString()}`,
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [43, 58, 103] },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(10);
  doc.text(`Subtotal: ৳${sale.subtotal.toLocaleString()}`, 150, finalY, { align: 'right' });
  doc.text(`Discount: -৳${sale.discount.toLocaleString()}`, 150, finalY + 6, { align: 'right' });
  doc.text(`Tax: +৳${sale.tax.toLocaleString()}`, 150, finalY + 12, { align: 'right' });
  doc.setFontSize(12);
  doc.setTextColor(43, 58, 103);
  doc.text(`Grand Total: ৳${sale.grandTotal.toLocaleString()}`, 150, finalY + 20, { align: 'right' });

  doc.save(`invoice-${sale.invoiceNumber}.pdf`);
};
