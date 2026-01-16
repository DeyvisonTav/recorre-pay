import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Card, Button, Select, PageLoader } from '../../components/ui';
import { customersService, plansService, subscriptionsService } from '../../services';
import { useToast } from '../../contexts/ToastContext';
import { Customer, Plan } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { ROUTES, DUE_DAYS } from '../../utils/constants';

const subscriptionSchema = z.object({
  customerId: z.string().min(1, 'Selecione um cliente'),
  planId: z.string().min(1, 'Selecione um plano'),
  dueDay: z.coerce.number().min(1).max(28),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

export default function SubscriptionForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const preselectedCustomerId = searchParams.get('customerId');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema) as any,
    defaultValues: {
      customerId: preselectedCustomerId || '',
      planId: '',
      dueDay: 10,
    },
  });

  const selectedPlanId = watch('planId');
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [customersResponse, plansData] = await Promise.all([
        customersService.getAll({ perPage: 1000 }),
        plansService.getAll(),
      ]);
      setCustomers(customersResponse.data);
      setPlans(plansData.filter((p) => p.isActive));
    } catch {
      showError('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SubscriptionFormData) => {
    try {
      setIsSaving(true);
      await subscriptionsService.create(data);
      success('Assinatura criada com sucesso!');
      navigate(ROUTES.SUBSCRIPTIONS);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Erro ao criar assinatura');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          to={ROUTES.SUBSCRIPTIONS}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para assinaturas
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nova Assinatura</h1>
        <p className="text-gray-500">Vincule um cliente a um plano de mensalidade</p>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Cliente"
            placeholder="Selecione um cliente"
            options={customers.map((c) => ({ value: c.id, label: c.name }))}
            error={errors.customerId?.message}
            {...register('customerId')}
          />

          <Select
            label="Plano"
            placeholder="Selecione um plano"
            options={plans.map((p) => ({
              value: p.id,
              label: `${p.name} - ${formatCurrency(p.price)}`,
            }))}
            error={errors.planId?.message}
            {...register('planId')}
          />

          {selectedPlan && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Resumo do plano</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {formatCurrency(selectedPlan.price)}/{selectedPlan.interval === 'MONTHLY' ? 'mês' : selectedPlan.interval === 'WEEKLY' ? 'semana' : 'ano'}
              </p>
              {selectedPlan.description && (
                <p className="text-sm text-gray-500 mt-1">{selectedPlan.description}</p>
              )}
            </div>
          )}

          <Select
            label="Dia do vencimento"
            options={DUE_DAYS}
            error={errors.dueDay?.message}
            {...register('dueDay')}
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isSaving}>
              Criar assinatura
            </Button>
            <Link to={ROUTES.SUBSCRIPTIONS}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
