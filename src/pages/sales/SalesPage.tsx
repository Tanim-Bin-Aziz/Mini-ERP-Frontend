import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Receipt, Download, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { productsApi } from '@/api/products.api';
import { customersApi } from '@/api/customers.api';
import { salesApi, type CreateSalePayload } from '@/api/sales.api';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { exportToCsv } from '@/lib/exportCsv';
import { exportTableToPdf, exportSaleInvoicePdf } from '@/lib/exportPdf';
import { useAuth } from '@/hooks/useAuth';

interface LineItem {
  productId: string;
  quantity: number;
}

const LIMIT = 10;

export const SalesPage = () => {
  const { hasPermission } = useAuth();
  const qc = useQueryClient();
  const canCreate = hasPermission('sale:create');

  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<CreateSalePayload['paymentMethod']>('cash');
  const [lineItems, setLineItems] = useState<LineItem[]>([{ productId: '', quantity: 1 }]);

  const { data: salesData, isLoading } = useQuery({
    queryKey: ['sales', page],
    queryFn: () => salesApi.list({ page, limit: LIMIT }),
  });

  const { data: productsData } = useQuery({
    queryKey: ['products-for-sale'],
    queryFn: () => productsApi.list({ page: 1, limit: 200 }),
    enabled: modalOpen,
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers-for-sale'],
    queryFn: () => customersApi.list({ page: 1, limit: 200 }),
    enabled: modalOpen,
  });

  const products = productsData?.data ?? [];
  const customers = customersData?.data ?? [];

  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => {
      const product = products.find((p) => p._id === item.productId);
      if (!product) return sum;
      return sum + product.price * item.quantity;
    }, 0);
  }, [lineItems, products]);

  const grandTotal = Math.max(subtotal - discount + tax, 0);

  const resetForm = () => {
    setCustomerId('');
    setDiscount(0);
    setTax(0);
    setPaymentMethod('cash');
    setLineItems([{ productId: '', quantity: 1 }]);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (payload: CreateSalePayload) => salesApi.create(payload),
    onSuccess: (sale) => {
      toast.success(`Sale recorded — ${sale.invoiceNumber}`);
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      setModalOpen(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleSubmit = () => {
    if (!customerId) return toast.error('Please select a customer');
    const validItems = lineItems.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) return toast.error('Add at least one product line');

    saveMutation.mutate({
      customer: customerId,
      items: validItems.map((i) => ({ product: i.productId, quantity: i.quantity })),
      discount: discount || undefined,
      tax: tax || undefined,
      paymentMethod,
    });
  };

  const sales = salesData?.data ?? [];
  const meta = salesData?.meta;

  const handleExportCsv = () => {
    if (sales.length === 0) return toast.error('No sales to export');
    exportToCsv(
      'sales',
      sales.map((s) => ({
        Invoice: s.invoiceNumber,
        Customer: typeof s.customer === 'string' ? s.customer : s.customer.name,
        Items: s.items.length,
        Subtotal: s.subtotal,
        Discount: s.discount,
        Tax: s.tax,
        GrandTotal: s.grandTotal,
        Status: s.status,
        Date: new Date(s.createdAt).toLocaleString(),
      }))
    );
  };

  const handleExportPdf = () => {
    if (sales.length === 0) return toast.error('No sales to export');
    exportTableToPdf({
      filename: 'sales',
      title: 'Sales History',
      head: ['Invoice', 'Customer', 'Items', 'Total', 'Status'],
      body: sales.map((s) => [
        s.invoiceNumber,
        typeof s.customer === 'string' ? s.customer : s.customer.name,
        s.items.length,
        `৳${s.grandTotal}`,
        s.status,
      ]),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-faint">Sale records with live stock deduction</p>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportCsv} size="sm" variant="outline">
            <Download size={14} />
            CSV
          </Button>
          <Button onClick={handleExportPdf} size="sm" variant="outline">
            <FileText size={14} />
            PDF
          </Button>
          {canCreate && (
            <Button onClick={openCreate} size="sm">
              <Plus size={15} />
              New sale
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper text-xs text-ink-faint">
              <tr>
                <th className="px-4 py-2.5 font-medium">Invoice</th>
                <th className="px-4 py-2.5 font-medium">Customer</th>
                <th className="px-4 py-2.5 font-medium">Items</th>
                <th className="px-4 py-2.5 font-medium">Total</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink-faint">
                    Loading sales…
                  </td>
                </tr>
              )}
              {!isLoading && sales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink-faint">
                    No sales recorded yet.
                  </td>
                </tr>
              )}
              {sales.map((s) => (
                <tr key={s._id} className="hover:bg-paper/60">
                  <td className="px-4 py-2.5 font-medium text-ink">
                    <span className="flex items-center gap-1.5">
                      <Receipt size={13} className="text-ink-faint" />
                      {s.invoiceNumber}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">
                    {typeof s.customer === 'string' ? s.customer : s.customer.name}
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">{s.items.length} item(s)</td>
                  <td className="px-4 py-2.5 font-medium text-ink">
                    ৳{s.grandTotal.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={s.status === 'completed' ? 'success' : 'danger'}>{s.status}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => exportSaleInvoicePdf(s)}
                      className="flex items-center gap-1 rounded p-1.5 text-xs text-ink-faint hover:bg-paper hover:text-brand"
                    >
                      <FileText size={13} />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta && (
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            onPageChange={setPage}
          />
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create sale">
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-soft">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">Select customer…</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} — {c.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-ink-soft">Products</label>
            {lineItems.map((item, idx) => {
              const product = products.find((p) => p._id === item.productId);
              return (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={item.productId}
                    onChange={(e) => {
                      const next = [...lineItems];
                      next[idx].productId = e.target.value;
                      setLineItems(next);
                    }}
                    className="h-9 flex-1 rounded-md border border-border bg-surface px-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="">Select product…</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id} disabled={p.stock === 0}>
                        {p.name} (stock: {p.stock}) — ৳{p.price}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={product?.stock ?? undefined}
                    value={item.quantity}
                    onChange={(e) => {
                      const next = [...lineItems];
                      next[idx].quantity = Number(e.target.value);
                      setLineItems(next);
                    }}
                    className="h-9 w-16 rounded-md border border-border bg-surface px-2 text-center text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  <button
                    onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))}
                    disabled={lineItems.length === 1}
                    className="rounded p-1.5 text-ink-faint hover:bg-paper hover:text-danger disabled:opacity-30"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
            <button
              onClick={() => setLineItems([...lineItems, { productId: '', quantity: 1 }])}
              className="text-xs font-medium text-brand hover:underline"
            >
              + Add another product
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Discount (৳)"
              type="number"
              min={0}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
            <Input
              label="Tax (৳)"
              type="number"
              min={0}
              value={tax}
              onChange={(e) => setTax(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-soft">
              Payment method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as CreateSalePayload['paymentMethod'])}
              className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile_banking">Mobile banking</option>
              <option value="bank_transfer">Bank transfer</option>
            </select>
          </div>

          <div className="rounded-md bg-paper p-3 text-sm">
            <div className="flex justify-between text-ink-soft">
              <span>Subtotal</span>
              <span>৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-ink-soft">
              <span>Discount</span>
              <span>-৳{discount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-ink-soft">
              <span>Tax</span>
              <span>+৳{tax.toLocaleString()}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-border pt-1 font-display text-base font-semibold text-ink">
              <span>Grand total</span>
              <span>৳{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <Button onClick={handleSubmit} isLoading={saveMutation.isPending}>
            Confirm sale
          </Button>
        </div>
      </Modal>
    </div>
  );
};
