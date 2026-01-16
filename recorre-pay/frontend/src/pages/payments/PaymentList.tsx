import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Send, CheckCircle, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Card, Button, Select, PageLoader } from '../../components/ui';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { StatusBadge, EmptyState, ConfirmDialog } from '../../components/shared';
import { paymentsService } from '../../services';
import { useToast } from '../../contexts/ToastContext';
import { Payment, PaginatedResponse } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'PAID', label: 'Pagos' },
  { value: 'OVERDUE', label: 'Atrasados' },
  { value: 'CANCELED', label: 'Cancelados' },
];

export default function PaymentList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 10, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

  const [markPaidId, setMarkPaidId] = useState<string | null>(null);
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    loadPayments();
  }, [searchParams]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const page = parseInt(searchParams.get('page') || '1');
      const status = searchParams.get('status') || '';

      const response = await paymentsService.getAll({
        page,
        perPage: 10,
        status: status || undefined,
      });

      setPayments(response.data);
      setMeta(response.meta);
    } catch {
      showError('Erro ao carregar pagamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setSearchParams({ status: value, page: '1' });
  };

  const handleSendReminder = async (paymentId: string) => {
    try {
      await paymentsService.sendReminder(paymentId);
      success('Lembrete enviado com sucesso!');
    } catch {
      showError('Erro ao enviar lembrete');
    }
  };

  const handleGenerateLink = async (paymentId: string) => {
    try {
      const { paymentLink } = await paymentsService.generateLink(paymentId);
      await navigator.clipboard.writeText(paymentLink);
      success('Link copiado para a área de transferência!');
    } catch {
      showError('Erro ao gerar link de pagamento');
    }
  };

  const handleMarkAsPaid = async () => {
    if (!markPaidId) return;

    try {
      setIsMarking(true);
      await paymentsService.markAsPaid(markPaidId);
      success('Pagamento marcado como pago!');
      setMarkPaidId(null);
      loadPayments();
    } catch {
      showError('Erro ao marcar como pago');
    } finally {
      setIsMarking(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Pagamentos</h1>
          <p className="text-gray-500">{meta.total} pagamentos</p>
        </div>
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
        {payments.length === 0 ? (
          <EmptyState
            title="Nenhum pagamento encontrado"
            description="Os pagamentos aparecerão aqui quando você criar assinaturas"
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Cliente</TableHeader>
                <TableHeader>Valor</TableHeader>
                <TableHeader>Vencimento</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Pago em</TableHeader>
                <TableHeader className="w-32"></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <Link
                      to={`/customers/${payment.customer?.id}`}
                      className="font-medium text-primary-600 hover:text-primary-700"
                    >
                      {payment.customer?.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>{formatDate(payment.dueDate)}</TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell>
                    {payment.paidAt ? formatDate(payment.paidAt) : '-'}
                  </TableCell>
                  <TableCell>
                    {payment.status !== 'PAID' && payment.status !== 'CANCELED' && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMarkPaidId(payment.id)}
                          title="Marcar como pago"
                        >
                          <CheckCircle className="w-4 h-4 text-success-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendReminder(payment.id)}
                          title="Enviar lembrete"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGenerateLink(payment.id)}
                          title="Copiar link de pagamento"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {payment.paymentLink && (
                      <a
                        href={payment.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
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

      {/* Mark as Paid Confirmation */}
      <ConfirmDialog
        isOpen={!!markPaidId}
        onClose={() => setMarkPaidId(null)}
        onConfirm={handleMarkAsPaid}
        title="Marcar como pago"
        message="Tem certeza que deseja marcar este pagamento como pago? Esta ação registrará o pagamento como recebido."
        confirmText="Marcar como pago"
        variant="warning"
        isLoading={isMarking}
      />
    </div>
  );
}
