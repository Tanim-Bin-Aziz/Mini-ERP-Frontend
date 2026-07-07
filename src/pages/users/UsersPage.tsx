import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Ban, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { usersApi, type AppUser, type CreateUserPayload, type UpdateUserPayload } from '@/api/users.api';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { useAuth } from '@/hooks/useAuth';

const ROLE_OPTIONS = ['Admin', 'Manager', 'Employee'];

const createSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Admin', 'Manager', 'Employee']),
});

const editSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['Admin', 'Manager', 'Employee']),
  password: z.union([z.string().min(6, 'At least 6 characters'), z.literal('')]).optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

const roleTone = (role: string) => {
  if (role === 'Admin') return 'brand' as const;
  if (role === 'Manager') return 'gold' as const;
  return 'neutral' as const;
};

export const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const qc = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', email: '', password: '', role: 'Employee' },
  });

  const editForm = useForm<EditFormValues>({ resolver: zodResolver(editSchema) });

  const openCreate = () => {
    setEditing(null);
    createForm.reset({ name: '', email: '', password: '', role: 'Employee' });
    setModalOpen(true);
  };

  const openEdit = (u: AppUser) => {
    setEditing(u);
    editForm.reset({ name: u.name, role: u.role as EditFormValues['role'], password: '' });
    setModalOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: () => {
      toast.success('Account created');
      qc.invalidateQueries({ queryKey: ['users'] });
      setModalOpen(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload),
    onSuccess: () => {
      toast.success('Account updated');
      qc.invalidateQueries({ queryKey: ['users'] });
      setModalOpen(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? usersApi.update(id, { isActive: true }) : usersApi.deactivate(id),
    onSuccess: () => {
      toast.success('Status updated');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onCreateSubmit = (values: CreateFormValues) => createMutation.mutate(values);

  const onEditSubmit = (values: EditFormValues) => {
    if (!editing) return;
    const payload: UpdateUserPayload = { name: values.name, role: values.role };
    if (values.password) payload.password = values.password;
    updateMutation.mutate({ id: editing._id, payload });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm text-ink-faint">
          <ShieldCheck size={15} />
          Manage Manager & Employee accounts. Admin-only area.
        </p>
        <Button onClick={openCreate} size="sm">
          <Plus size={15} />
          Add user
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper text-xs text-ink-faint dark:bg-white/5">
              <tr>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-white/10">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink-faint">
                    Loading users…
                  </td>
                </tr>
              )}
              {!isLoading && (users?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink-faint">
                    No users found.
                  </td>
                </tr>
              )}
              {users?.map((u) => (
                <tr key={u._id} className="hover:bg-paper/60 dark:hover:bg-white/5">
                  <td className="px-4 py-2.5 font-medium text-ink">
                    {u.name}
                    {currentUser?.id === u._id && (
                      <span className="ml-1.5 text-xs text-ink-faint">(you)</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">{u.email}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone={roleTone(u.role)}>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={u.isActive ? 'success' : 'danger'}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(u)}
                        className="rounded p-1.5 text-ink-faint hover:bg-paper hover:text-brand dark:hover:bg-white/10"
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      {currentUser?.id !== u._id && (
                        <button
                          onClick={() =>
                            statusMutation.mutate({ id: u._id, isActive: !u.isActive })
                          }
                          className="rounded p-1.5 text-ink-faint hover:bg-paper hover:text-danger dark:hover:bg-white/10"
                          aria-label={u.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {u.isActive ? <Ban size={14} /> : <CheckCircle2 size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit user' : 'Add user'}
      >
        {!editing ? (
          <form
            onSubmit={createForm.handleSubmit(onCreateSubmit)}
            className="flex flex-col gap-3"
            noValidate
          >
            <Input
              label="Full name"
              error={createForm.formState.errors.name?.message}
              {...createForm.register('name')}
            />
            <Input
              label="Email"
              type="email"
              error={createForm.formState.errors.email?.message}
              {...createForm.register('email')}
            />
            <Input
              label="Password"
              type="password"
              error={createForm.formState.errors.password?.message}
              {...createForm.register('password')}
            />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">Role</label>
              <select
                {...createForm.register('role')}
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-white/10 dark:bg-white/5"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="mt-1" isLoading={createMutation.isPending}>
              Create account
            </Button>
          </form>
        ) : (
          <form
            onSubmit={editForm.handleSubmit(onEditSubmit)}
            className="flex flex-col gap-3"
            noValidate
          >
            <Input
              label="Full name"
              error={editForm.formState.errors.name?.message}
              {...editForm.register('name')}
            />
            <Input label="Email" value={editing.email} disabled />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">Role</label>
              <select
                {...editForm.register('role')}
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-white/10 dark:bg-white/5"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Reset password (optional)"
              type="password"
              placeholder="Leave blank to keep current password"
              error={editForm.formState.errors.password?.message}
              {...editForm.register('password')}
            />
            <Button type="submit" className="mt-1" isLoading={updateMutation.isPending}>
              Save changes
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
};
