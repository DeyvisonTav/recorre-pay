import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Mail, Phone, FileText, Calendar, CreditCard } from 'lucide-react';
import { Card, CardHeader, Button, Badge, PageLoader } from '../../components/ui';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { StatusBadge, EmptyState, ConfirmDialog } from '../../components/shared';
import { customersService } from '../../services';
import { useToast } from '../../contexts/ToastContext';
import { Customer, Payment } from '../../types';
import { formatCurrency, formatDate, formatPhone, formatDocument } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadCustomerData();
    }
  }, [id]);

  const loadCustomerData = async () => {
    try {
      setIsLoading(true);
      const [customerData, paymentsData] = await Promise.all([
        customersService.getById(id!),
        customersService.getPayments(id!),
      ]);
      setCustomer(customerData);
      setPayments(paymentsData);
    } catch {
      showError('Erro ao carregar dados do cliente');
      navigate(ROUTES.CUSTOMERS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await customersService.delete(id!);
      success('Cliente removido com sucesso');
      navigate(ROUTES.CUSTOMERS);
    } catch {
      showError('Erro ao remover cliente');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !customer) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Link
            to={ROUTES.CUSTOMERS}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para clientes
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={customer.isActive ? 'success' : 'default'}>
              {customer.isActive ? 'Ativo' : 'Inativo'}
            </Badge>
            <span className="text-gray-500">Cliente desde {formatDate(customer.createdAt)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/customers/${id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button variant="danger" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Remover
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <Card className="lg:col-span-1">
          <CardHeader title="Informações" />
          <div className="space-y-4">
            <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={customer.email} />
            <InfoItem icon={<Phone className="w-4 h-4" />} label="WhatsApp" value={formatPhone(customer.phone)} />
            {customer.document && (
              <InfoItem icon={<FileText className="w-4 h-4" />} label="CPF/CNPJ" value={formatDocument(customer.document)} />
            )}
            {customer.notes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Observações</p>
                <p className="text-sm text-gray-700">{customer.notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Subscriptions */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Assinaturas"
            action={
              <Link to={`${ROUTES.SUBSCRIPTION_NEW}?customerId=${id}`}>
                <Button size="sm">Nova Assinatura</Button>
              </Link>
            }
          />
          {customer.subscriptions?.length === 0 ? (
            <EmptyState
              icon={<CreditCard className="w-8 h-8" />}
              title="Nenhuma assinatura"
              description="Este cliente ainda não possui assinaturas"
            />
          ) : (
            <div className="space-y-3">
              {customer.subscriptions?.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{sub.plan?.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(sub.plan?.price || 0)} - Vence dia {sub.dueDay}
                    </p>
                  </div>
                  <StatusBadge status={sub.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader title="Histórico de Pagamentos" />
        {payments.length === 0 ? (
          <EmptyState
            title="Nenhum pagamento"
            description="Este cliente ainda não possui histórico de pagamentos"
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Vencimento</TableHeader>
                <TableHeader>Valor</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Pago em</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDate(payment.dueDate)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell>
                    {payment.paidAt ? formatDate(payment.paidAt) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Remover cliente"
        message="Tem certeza que deseja remover este cliente? Todas as assinaturas e histórico de pagamentos serão perdidos."
        confirmText="Remover"
        isLoading={isDeleting}
      />
    </div>
  );
}

// Info Item Component
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
