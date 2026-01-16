import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button, Input, Card } from '../../components/ui';
import { APP_NAME, ROUTES } from '../../utils/constants';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const { error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">{APP_NAME}</h1>
          <p className="text-gray-500 mt-2">Gerencie suas mensalidades com facilidade</p>
        </div>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Entrar na sua conta</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-600">Lembrar de mim</span>
              </label>
              <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-primary-600 hover:text-primary-700">
                Esqueceu a senha?
              </Link>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem uma conta?{' '}
            <Link to={ROUTES.REGISTER} className="text-primary-600 hover:text-primary-700 font-medium">
              Criar conta grátis
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
