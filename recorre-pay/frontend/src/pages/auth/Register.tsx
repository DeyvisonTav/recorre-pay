import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button, Input, Card } from '../../components/ui';
import { APP_NAME, ROUTES } from '../../utils/constants';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
  businessName: z.string().min(2, 'Nome do negócio deve ter no mínimo 2 caracteres'),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const { register: registerUser } = useAuth();
  const { error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        businessName: data.businessName,
        phone: data.phone,
      });
    } catch (err: any) {
      showError(err.response?.data?.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">{APP_NAME}</h1>
          <p className="text-gray-500 mt-2">Crie sua conta e comece a cobrar</p>
        </div>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Criar sua conta</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Seu nome"
              type="text"
              placeholder="João Silva"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Nome do negócio"
              type="text"
              placeholder="Studio Pilates"
              error={errors.businessName?.message}
              {...register('businessName')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="WhatsApp (opcional)"
              type="tel"
              placeholder="(11) 99999-9999"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirmar senha"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Criar conta
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem uma conta?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary-600 hover:text-primary-700 font-medium">
              Entrar
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
