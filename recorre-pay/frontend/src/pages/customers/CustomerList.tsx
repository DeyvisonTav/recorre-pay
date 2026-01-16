import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, Button, Input, PageLoader } from '../../components/ui';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { EmptyState, ConfirmDialog } from '../../components/shared';
import { customersService } from '../../services';
import { useToast } from '../../contexts/ToastContext';
import { Customer, PaginatedResponse } from '../../types';
import { formatPhone, formatDate } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

export default function CustomerList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 10, totalPages: 1 });
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [searchParams]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const page = parseInt(searchParams.get('page') || '1');
      const searchQuery = searchParams.get('search') || '';

      const response = await customersService.getAll({
        page,
        perPage: 10,
        search: searchQuery,
      });

      setCustomers(response.data);
      setMeta(response.meta);
    } catch {
      showError('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ search, page: '1' });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      await customersService.delete(deleteId);
      success('Cliente removido com sucesso');
      setDeleteId(null);
      loadCustomers();
    } catch {
      showError('Erro ao remover cliente');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500">{meta.total} clientes cadastrados</p>
        </div>
        <Link to={ROUTES.CUSTOMER_NEW}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
        </form>
      </Card>

      {/* Table */}
      <Card padding="none">
        {customers.length === 0 ? (
          <EmptyState
            title="Nenhum cliente encontrado"
            description="Comece cadastrando seu primeiro cliente"
            action={
              <Link to={ROUTES.CUSTOMER_NEW}>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Cliente
                </Button>
              </Link>
            }
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Nome</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>WhatsApp</TableHeader>
                <TableHeader>Cadastrado em</TableHeader>
                <TableHeader className="w-20"></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-gray-500">{customer.email}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-gray-500">{formatPhone(customer.phone)}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-gray-500">{formatDate(customer.createdAt)}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link to={`/customers/${customer.id}`}>
                        <Button variant="ghost" size="sm" title="Ver detalhes">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/customers/${customer.id}/edit`}>
                        <Button variant="ghost" size="sm" title="Editar">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Remover"
                        onClick={() => setDeleteId(customer.id)}
                      >
                        <Trash2 className="w-4 h-4 text-danger-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Página {meta.page} de {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page <= 1}
                onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(meta.page - 1) })}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(meta.page + 1) })}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remover cliente"
        message="Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita."
        confirmText="Remover"
        isLoading={isDeleting}
      />
    </div>
  );
}
