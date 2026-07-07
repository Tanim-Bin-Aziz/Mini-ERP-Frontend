import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ImageOff,
  Download,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { productsApi, type ProductFormValues } from "@/api/products.api";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { exportToCsv } from "@/lib/exportCsv";
import { exportTableToPdf } from "@/lib/exportPdf";
import { useAuth } from "@/hooks/useAuth";
import type { Product } from "@/types";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sku: z.string().min(2, "SKU must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0, "Selling price cannot be negative"),
  costPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  lowStockThreshold: z.coerce.number().min(0).optional(),
  unit: z.string().optional(),
  description: z.string().optional(),
  image: z.instanceof(FileList).optional(),
});

type ProductFormSchema = z.infer<typeof productSchema>;

const LIMIT = 10;

export const ProductsPage = () => {
  const { hasPermission } = useAuth();
  const qc = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const canCreate = hasPermission("product:create");
  const canUpdate = hasPermission("product:update");
  const canDelete = hasPermission("product:delete");

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, search],
    queryFn: () =>
      productsApi.list({ page, limit: LIMIT, search: search || undefined }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormSchema>({ resolver: zodResolver(productSchema) });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", sku: "", category: "", price: 0, stock: 0 });
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    reset({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      costPrice: product.costPrice,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      unit: product.unit,
      description: product.description,
    });
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (values: ProductFormValues) =>
      editing
        ? productsApi.update(editing._id, values)
        : productsApi.create(values),
    onSuccess: () => {
      toast.success(editing ? "Product updated" : "Product created");
      qc.invalidateQueries({ queryKey: ["products"] });
      setModalOpen(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
  const onSubmit = (values: ProductFormSchema) => {
    if (!editing && (!values.image || values.image.length === 0)) {
      toast.error("Product image is required");
      return;
    }
    saveMutation.mutate(values as ProductFormValues);
  };

  const products = data?.data ?? [];
  const meta = data?.meta;

  const handleExportCsv = () => {
    if (products.length === 0) return toast.error("No products to export");
    exportToCsv(
      "products",
      products.map((p) => ({
        Name: p.name,
        SKU: p.sku,
        Category: p.category,
        Price: p.price,
        CostPrice: p.costPrice ?? "",
        Stock: p.stock,
        Unit: p.unit ?? "",
      })),
    );
  };

  const handleExportPdf = () => {
    if (products.length === 0) return toast.error("No products to export");
    exportTableToPdf({
      filename: "products",
      title: "Product Inventory",
      head: ["Name", "SKU", "Category", "Price", "Stock"],
      body: products.map((p) => [
        p.name,
        p.sku,
        p.category,
        `৳${p.price}`,
        p.stock,
      ]),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={15}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or SKU..."
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
              Add product
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper text-xs text-ink-faint">
              <tr>
                <th className="px-4 py-2.5 font-medium">Product</th>
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 font-medium">Price</th>
                <th className="px-4 py-2.5 font-medium">Stock</th>
                {(canUpdate || canDelete) && (
                  <th className="px-4 py-2.5 font-medium">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-ink-faint"
                  >
                    Loading products…
                  </td>
                </tr>
              )}
              {!isLoading && products.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-ink-faint"
                  >
                    No products found.
                  </td>
                </tr>
              )}
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-paper/60">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      {p.images?.[0]?.url ? (
                        <img
                          src={p.images[0].url}
                          alt={p.name}
                          className="h-8 w-8 rounded-md border border-border object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-paper text-ink-faint">
                          <ImageOff size={13} />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-ink">{p.name}</p>
                        <p className="text-xs text-ink-faint">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">{p.category}</td>
                  <td className="px-4 py-2.5 text-ink-soft">
                    ৳{p.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={p.stock < 5 ? "danger" : "success"}>
                      {p.stock} in stock
                    </Badge>
                  </td>
                  {(canUpdate || canDelete) && (
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        {canUpdate && (
                          <button
                            onClick={() => openEdit(p)}
                            className="rounded p-1.5 text-ink-faint hover:bg-paper hover:text-brand"
                            aria-label="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${p.name}"?`))
                                deleteMutation.mutate(p._id);
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
        title={editing ? "Edit product" : "Add product"}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3"
          noValidate
        >
          <Input
            label="Product name"
            error={errors.name?.message}
            {...register("name")}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="SKU"
              error={errors.sku?.message}
              {...register("sku")}
            />
            <Input
              label="Category"
              error={errors.category?.message}
              {...register("category")}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Selling price"
              type="number"
              step="0.01"
              error={errors.price?.message}
              {...register("price")}
            />
            <Input
              label="Cost price"
              type="number"
              step="0.01"
              {...register("costPrice")}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Stock quantity"
              type="number"
              error={errors.stock?.message}
              {...register("stock")}
            />
            <Input
              label="Low stock alert at"
              type="number"
              {...register("lowStockThreshold")}
            />
          </div>
          <Input label="Unit (e.g. pcs, kg)" {...register("unit")} />
          <Input
            label={editing ? "Replace image (optional)" : "Product image"}
            type="file"
            accept="image/*"
            {...register("image")}
          />
          {!editing && (
            <p className="-mt-2 text-xs text-ink-faint">
              Image is required when creating a product.
            </p>
          )}
          <Button
            type="submit"
            className="mt-1"
            isLoading={saveMutation.isPending}
          >
            {editing ? "Save changes" : "Create product"}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
