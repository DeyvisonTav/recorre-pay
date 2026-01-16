import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Play, Pause, XCircle, MoreVertical } from 'lucide-react';
import { Card, Button, Select, PageLoader } from '../../components/ui';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { StatusBadge, EmptyState, ConfirmDialog } from '../../components/shared';
import { subscriptionsService } from '../../services';
import { useToast } from '../../contexts/ToastContext';
import { Subscription, PaginatedResponse } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'ACTIVE', label: 'Ativos' },
  { value: 'PAUSED', label: 'Pausados' },
  { value: 'CANCELED', label: 'Cancelados' },
  { value: 'PAST_DUE', label: 'Inadimplentes' },
];

export default function SubscriptionList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 10, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

  const [actionDialog, setActionDialog] = useState<{
    type: 'cancel' | 'pause' | 'resume';
    id: string;
  } | null>(null);
  const [isActioning, setIsActioning] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, [searchParams]);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      const page = parseInt(searchParams.get('page') || '1');
      const status = searchParams.get('status') || '';

      const response = await subscriptionsService.getAll({
        page,
        perPage: 10,
        status: status || undefined,
      });

      setSubscriptions(response.data);
      setMeta(response.meta);
    } catch {
      showError('Erro ao carregar assinaturas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setSearchParams({ status: value, page: '1' });
  };

  const handleAction = async () => {
    if (!actionDialog) return;

    try {
      setIsActioning(true);
      const { type, id } = actionDialog;

      switch (type) {
        case 'cancel':
          await subscriptionsService.cancel(id);
          success('Assinatura cancelada com sucesso');
          break;
        case 'pause':
          await subscriptionsService.pause(id);
          success('Assinatura pausada com sucesso');
          break;
        case 'resume':
          await subscriptionsService.resume(id);
          success('Assinatura reativada com sucesso');
          break;
      }

      setActionDialog(null);
      loadSubscriptions();
    } catch {
      showError('Erro ao executar ação');
    } finally {
      setIsActioning(false);
    }
  };

  const getActionDialogContent = () => {
    if (!actionDialog) return { title: '', message: '' };

    switch (actionDialog.type) {
      case 'cancel':
        return {
          title: 'Cancelar assinatura',
          message: 'Tem certeza que deseja cancelar esta assinatura? O cliente não será mais cobrado.',
        };
      case 'pause':
        return {
          title: 'Pausar assinatura',
          message: 'Tem certeza que deseja pausar esta assinatura? As cobranças serão suspensas temporariamente.',
        };
      case 'resume':
        return {
          title: 'Reativar assinatura',
          message: 'Tem certeza que deseja reativar esta assinatura? As cobranças serão retomadas.',
        };
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
          <h1 className="text-2xl font-bold text-gray-900">Assinaturas</h1>
          <p className="text-gray-500">{meta.total} assinaturas</p>
        </div>
        <Link to={ROUTES.SUBSCRIPTION_NEW}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Assinatura
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex gap-4">
          <div className="w-48">
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        {subscriptions.length === 0 ? (
          <EmptyState
            title="Nenhuma assinatura encontrada"
            description="Crie uma assinatura para vincular um cliente a um plano"
            action={
              <Link to={ROUTES.SUBSCRIPTION_NEW}>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Assinatura
                </Button>
              </Link>
            }
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Cliente</TableHeader>
                <TableHeader>Plano</TableHeader>
                <TableHeader>Valor</TableHeader>
                <TableHeader>Vencimento</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader className="w-32"></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <Link
                      to={`/customers/${sub.customer?.id}`}
                      className="font-medium text-primary-600 hover:text-primary-700"
                    >
                      {sub.customer?.name}
                    </Link>
                  </TableCell>
                  <TableCell>{sub.plan?.name}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(sub.plan?.price || 0)}
                  </TableCell>
                  <TableCell>Dia {sub.dueDay}</TableCell>
                  <TableCell>
                    <StatusBadge status={sub.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {sub.status === 'ACTIVE' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActionDialog({ type: 'pause', id: sub.id })}
                          title="Pausar"
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      )}
                      {(sub.status === 'PAUSED' || sub.status === 'PAST_DUE') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActionDialog({ type: 'resume', id: sub.id })}
                          title="Reativar"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      {sub.status !== 'CANCELED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActionDialog({ type: 'cancel', id: sub.id })}
                          title="Cancelar"
                        >
                          <XCircle className="w-4 h-4 text-danger-500" />
                        </Button>
                      )}
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

      {/* Action Confirmation */}
      <ConfirmDialog
        isOpen={!!actionDialog}
        onClose={() => setActionDialog(null)}
        onConfirm={handleAction}
        title={getActionDialogContent().title}
        message={getActionDialogContent().message}
        confirmText="Confirmar"
        variant={actionDialog?.type === 'cancel' ? 'danger' : 'warning'}
        isLoading={isActioning}
      />
    </div>
  );
}
