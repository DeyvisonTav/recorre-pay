import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Users, CreditCard, AlertTriangle, TrendingUp, Clock, Send } from 'lucide-react';
import { Card, Button, PageLoader } from '../../components/ui';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { StatusBadge } from '../../components/shared';
import { dashboardService, paymentsService } from '../../services';
import { useToast } from '../../contexts/ToastContext';
import { DashboardSummary, OverduePayment, UpcomingPayment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

export default function Dashboard() {
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [overdue, setOverdue] = useState<OverduePayment[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingPayment[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [summaryData, overdueData, upcomingData] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getOverdue(),
        dashboardService.getUpcoming(),
      ]);
      setSummary(summaryData);
      setOverdue(overdueData);
      setUpcoming(upcomingData);
    } catch {
      showError('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReminder = async (paymentId: string) => {
    try {
      await paymentsService.sendReminder(paymentId);
      success('Lembrete enviado com sucesso!');
    } catch {
      showError('Erro ao enviar lembrete');
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral das suas mensalidades</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receita Esperada"
          value={formatCurrency(summary?.totalExpected || 0)}
          icon={<DollarSign className="w-5 h-5" />}
          color="primary"
        />
        <StatCard
          title="Total Recebido"
          value={formatCurrency(summary?.totalReceived || 0)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="success"
        />
        <StatCard
          title="Em Atraso"
          value={formatCurrency(summary?.totalOverdue || 0)}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="danger"
        />
        <StatCard
          title="Clientes Ativos"
          value={summary?.activeCustomers || 0}
          icon={<Users className="w-5 h-5" />}
          color="default"
        />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Payments */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger-500" />
              <h2 className="text-lg font-semibold text-gray-900">Pagamentos Atrasados</h2>
            </div>
            <Link to={`${ROUTES.PAYMENTS}?status=OVERDUE`}>
              <Button variant="ghost" size="sm">Ver todos</Button>
            </Link>
          </div>

          {overdue.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum pagamento atrasado</p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Cliente</TableHeader>
                  <TableHeader>Valor</TableHeader>
                  <TableHeader>Dias</TableHeader>
                  <TableHeader></TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {overdue.slice(0, 5).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.customer.name}</p>
                        <p className="text-xs text-gray-500">{payment.customer.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <StatusBadge status="OVERDUE" />
                      <span className="ml-2 text-xs text-gray-500">{payment.daysOverdue}d</span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSendReminder(payment.id)}
                        title="Enviar lembrete"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-900">Próximos Vencimentos</h2>
            </div>
            <Link to={ROUTES.PAYMENTS}>
              <Button variant="ghost" size="sm">Ver todos</Button>
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum vencimento próximo</p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Cliente</TableHeader>
                  <TableHeader>Valor</TableHeader>
                  <TableHeader>Vencimento</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {upcoming.slice(0, 5).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.customer.name}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(payment.dueDate)}</span>
                      {payment.daysUntilDue <= 3 && (
                        <span className="ml-2 text-xs text-warning-600">
                          em {payment.daysUntilDue}d
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <Link to={ROUTES.CUSTOMER_NEW}>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </Link>
          <Link to={ROUTES.PLAN_NEW}>
            <Button variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              Novo Plano
            </Button>
          </Link>
          <Link to={ROUTES.SUBSCRIPTION_NEW}>
            <Button variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              Nova Assinatura
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'danger' | 'warning' | 'default';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    danger: 'bg-danger-50 text-danger-600',
    warning: 'bg-warning-50 text-warning-600',
    default: 'bg-gray-100 text-gray-600',
  };

  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}
