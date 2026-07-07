import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Download, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { customersApi, type CustomerFormValues } from '@/api/customers.api';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { exportToCsv } from '@/lib/exportCsv';
import { exportTableToPdf } from '@/lib/exportPdf';
import { useAuth } from '@/hooks/useAuth';
import type { Customer } from '@/types';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(6, 'Phone must be at least 6 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
});

type CustomerFormSchema = z.infer<typeof customerSchema>;
const LIMIT = 10;

export const CustomersPage = () => {
  const { hasPermission } = useAuth();
  const qc = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const canCreate = hasPermission('customer:create');
  const canUpdate = hasPermission('customer:update');
  const canDelete = hasPermission('customer:delete');

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => customersApi.list({ page, limit: LIMIT, search: search || undefined }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormSchema>({ resolver: zodResolver(customerSchema) });

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', phone: '', email: '', address: '' });
    setModalOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    reset({
      name: customer.name,
      phone: customer.phone,
      email: customer.email ?? '',
      address: customer.address ?? '',
    });
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (values: CustomerFormValues) =>
      editing ? customersApi.update(editing._id, values) : customersApi.create(values),
    onSuccess: () => {
      toast.success(editing ? 'Customer updated' : 'Customer added');
      qc.invalidateQueries({ queryKey: ['customers'] });
      setModalOpen(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersApi.remove(id),
    onSuccess: () => {
      toast.success('Customer deleted');
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = (values: CustomerFormSchema) => saveMutation.mutate(values);

  const customers = data?.data ?? [];
  const meta = data?.meta;

  const handleExportCsv = () => {
    if (customers.length === 0) return toast.error('No customers to export');
    exportToCsv(
      'customers',
      customers.map((c) => ({
        Name: c.name,
        Phone: c.phone,
        Email: c.email ?? '',
        Address: c.address ?? '',
      }))
    );
  };

  const handleExportPdf = () => {
    if (customers.length === 0) return toast.error('No customers to export');
    exportTableToPdf({
      filename: 'customers',
      title: 'Customer List',
      head: ['Name', 'Phone', 'Email', 'Address'],
      body: customers.map((c) => [c.name, c.phone, c.email ?? '-', c.address ?? '-']),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or phone..."
            className="h-9 w-full rounded-md border border-border bg-surface pl-8 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-white/10 dark:bg-white/5"
          />
        </div>
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
              Add customer
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper text-xs text-ink-faint">
              <tr>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Phone</th>
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium hidden sm:table-cell">Address</th>
                {(canUpdate || canDelete) && <th className="px-4 py-2.5 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink-faint">
                    Loading customers…
                  </td>
                </tr>
              )}
              {!isLoading && customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink-faint">
                    No customers found.
                  </td>
                </tr>
              )}
              {customers.map((c) => (
                <tr key={c._id} className="hover:bg-paper/60">
                  <td className="px-4 py-2.5 font-medium text-ink">{c.name}</td>
                  <td className="px-4 py-2.5 text-ink-soft">{c.phone}</td>
                  <td className="px-4 py-2.5 text-ink-soft">{c.email || '—'}</td>
                  <td className="hidden px-4 py-2.5 text-ink-soft sm:table-cell">
                    {c.address || '—'}
                  </td>
                  {(canUpdate || canDelete) && (
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        {canUpdate && (
                          <button
                            onClick={() => openEdit(c)}
                            className="rounded p-1.5 text-ink-faint hover:bg-paper hover:text-brand"
                            aria-label="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${c.name}"?`)) deleteMutation.mutate(c._id);
                            }}
                            className="rounded p-1.5 text-ink-faint hover:bg-paper hover:text-danger"
                            aria-label="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit customer' : 'Add customer'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
          <Input label="Full name" error={errors.name?.message} {...register('name')} />
          <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
          <Input label="Email (optional)" error={errors.email?.message} {...register('email')} />
          <Input label="Address (optional)" {...register('address')} />
          <Button type="submit" className="mt-1" isLoading={saveMutation.isPending}>
            {editing ? 'Save changes' : 'Add customer'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
