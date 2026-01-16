import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, CreditCard, Bell } from 'lucide-react';
import { Card, CardHeader, Button, Input, Select, PageLoader } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { DUE_DAYS } from '../../utils/constants';

const settingsSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  defaultDueDay: z.coerce.number().min(1).max(28),
  reminderDaysBefore: z.coerce.number().min(1).max(10),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { tenant } = useAuth();
  const { success, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema) as any,
  });

  useEffect(() => {
    if (tenant) {
      reset({
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone || '',
        defaultDueDay: tenant.defaultDueDay,
        reminderDaysBefore: tenant.reminderDaysBefore,
      });
    }
  }, [tenant, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setIsSaving(true);
      // await settingsService.update(data);
      success('Configurações salvas com sucesso!');
    } catch {
      showError('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500">Gerencie as configurações do seu negócio</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Info */}
        <Card>
          <CardHeader
            title="Informações do Negócio"
            description="Dados que aparecem nas cobranças e comunicações"
          />
          <div className="space-y-4">
            <Input
              label="Nome do negócio"
              placeholder="Studio Pilates"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email de contato"
              type="email"
              placeholder="contato@empresa.com"
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
          </div>
        </Card>

        {/* Billing Settings */}
        <Card>
          <CardHeader
            title="Configurações de Cobrança"
            description="Defina as configurações padrão para novas assinaturas"
          />
          <div className="space-y-4">
            <Select
              label="Dia de vencimento padrão"
              options={DUE_DAYS}
              error={errors.defaultDueDay?.message}
              {...register('defaultDueDay')}
            />

            <Select
              label="Enviar lembrete antes do vencimento"
              options={[
                { value: 1, label: '1 dia antes' },
                { value: 2, label: '2 dias antes' },
                { value: 3, label: '3 dias antes' },
                { value: 5, label: '5 dias antes' },
                { value: 7, label: '7 dias antes' },
              ]}
              error={errors.reminderDaysBefore?.message}
              {...register('reminderDaysBefore')}
            />
          </div>
        </Card>

        {/* Stripe Integration */}
        <Card>
          <CardHeader
            title="Integração com Stripe"
            description="Configure sua conta Stripe para receber pagamentos"
          />
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <CreditCard className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Stripe</p>
                <p className="text-sm text-gray-500">Receba pagamentos via cartão, Pix e boleto</p>
              </div>
            </div>
            <Button variant="outline" type="button">
              Conectar
            </Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader
            title="Notificações"
            description="Configure como seus clientes recebem lembretes"
          />
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-500">Enviar lembretes por email</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer opacity-50">
              <input
                type="checkbox"
                disabled
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <p className="font-medium text-gray-900">WhatsApp</p>
                <p className="text-sm text-gray-500">Em breve - Enviar lembretes por WhatsApp</p>
              </div>
            </label>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" isLoading={isSaving}>
            Salvar configurações
          </Button>
        </div>
      </form>
    </div>
  );
}
