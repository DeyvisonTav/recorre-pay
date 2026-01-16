import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { Card, Button, PageLoader, Modal, Input, Select } from '../../components/ui';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { EmptyState, ConfirmDialog } from '../../components/shared';
import { plansService } from '../../services';
import { useToast } from '../../contexts/ToastContext';
import { Plan } from '../../types';
import { formatCurrency, getIntervalLabel } from '../../utils/formatters';
import { BILLING_INTERVALS } from '../../utils/constants';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const planSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
  price: z.coerce.number().min(1, 'Valor deve ser maior que zero'),
  interval: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']),
  intervalCount: z.coerce.number().min(1).default(1),
});

type PlanFormData = z.infer<typeof planSchema>;

export default function PlanList() {
  const { success, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema) as any,
    defaultValues: {
      interval: 'MONTHLY',
      intervalCount: 1,
    },
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const data = await plansService.getAll();
      setPlans(data);
    } catch {
      showError('Erro ao carregar planos');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      reset({
        name: plan.name,
        description: plan.description || '',
        price: plan.price,
        interval: plan.interval,
        intervalCount: plan.intervalCount,
      });
    } else {
      setEditingPlan(null);
      reset({
        name: '',
        description: '',
        price: 0,
        interval: 'MONTHLY',
        intervalCount: 1,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    reset();
  };

  const onSubmit = async (data: PlanFormData) => {
    try {
      setIsSaving(true);
      if (editingPlan) {
        await plansService.update(editingPlan.id, data);
        success('Plano atualizado com sucesso!');
      } else {
        await plansService.create(data);
        success('Plano criado com sucesso!');
      }
      closeModal();
      loadPlans();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Erro ao salvar plano');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      await plansService.delete(deleteId);
      success('Plano removido com sucesso');
      setDeleteId(null);
      loadPlans();
    } catch {
      showError('Erro ao remover plano');
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
          <h1 className="text-2xl font-bold text-gray-900">Planos</h1>
          <p className="text-gray-500">{plans.length} planos cadastrados</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {/* Table */}
      <Card padding="none">
        {plans.length === 0 ? (
          <EmptyState
            title="Nenhum plano cadastrado"
            description="Crie seu primeiro plano de mensalidade"
            action={
              <Button onClick={() => openModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Plano
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Nome</TableHeader>
                <TableHeader>Valor</TableHeader>
                <TableHeader>Frequência</TableHeader>
                <TableHeader>Assinaturas</TableHeader>
                <TableHeader className="w-20"></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{plan.name}</p>
                      {plan.description && (
                        <p className="text-sm text-gray-500">{plan.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(plan.price)}
                  </TableCell>
                  <TableCell>
                    {getIntervalLabel(plan.interval, plan.intervalCount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      {plan._count?.subscriptions || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openModal(plan)}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(plan.id)}
                        title="Remover"
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
      </Card>

      {/* Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingPlan ? 'Editar Plano' : 'Novo Plano'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome do plano"
            placeholder="Ex: Plano Mensal, Personal 3x/semana"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Descrição (opcional)"
            placeholder="Descrição do plano"
            error={errors.description?.message}
            {...register('description')}
          />

          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            placeholder="0,00"
            error={errors.price?.message}
            {...register('price')}
          />

          <Select
            label="Frequência"
            options={BILLING_INTERVALS.map((i) => ({ value: i.value, label: i.label }))}
            error={errors.interval?.message}
            {...register('interval')}
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isSaving}>
              {editingPlan ? 'Salvar alterações' : 'Criar plano'}
            </Button>
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remover plano"
        message="Tem certeza que deseja remover este plano? Assinaturas vinculadas não serão afetadas."
        confirmText="Remover"
        isLoading={isDeleting}
      />
    </div>
  );
}
