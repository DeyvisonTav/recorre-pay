import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Card, Button, Input, PageLoader } from '../../components/ui';
import { customersService } from '../../services';
import { useToast } from '../../contexts/ToastContext';
import { ROUTES } from '../../utils/constants';

const customerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'WhatsApp inválido'),
  document: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(!!id);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    if (id) {
      loadCustomer();
    }
  }, [id]);

  const loadCustomer = async () => {
    try {
      const customer = await customersService.getById(id!);
      reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        document: customer.document || '',
        notes: customer.notes || '',
      });
    } catch {
      showError('Erro ao carregar cliente');
      navigate(ROUTES.CUSTOMERS);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setIsSaving(true);
      if (isEditing) {
        await customersService.update(id!, data);
        success('Cliente atualizado com sucesso!');
      } else {
        await customersService.create(data);
        success('Cliente cadastrado com sucesso!');
      }
      navigate(ROUTES.CUSTOMERS);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Erro ao salvar cliente');
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
          to={ROUTES.CUSTOMERS}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para clientes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
        </h1>
        <p className="text-gray-500">
          {isEditing ? 'Atualize as informações do cliente' : 'Preencha os dados do novo cliente'}
        </p>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome completo"
            placeholder="João Silva"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="joao@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="WhatsApp"
            type="tel"
            placeholder="(11) 99999-9999"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="CPF/CNPJ (opcional)"
            placeholder="000.000.000-00"
            error={errors.document?.message}
            {...register('document')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações (opcional)
            </label>
            <textarea
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              placeholder="Anotações sobre o cliente..."
              {...register('notes')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isSaving}>
              {isEditing ? 'Salvar alterações' : 'Cadastrar cliente'}
            </Button>
            <Link to={ROUTES.CUSTOMERS}>
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
