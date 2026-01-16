import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '../../services';
import { useToast } from '../../contexts/ToastContext';
import { Button, Input, Card } from '../../components/ui';
import { APP_NAME, ROUTES } from '../../utils/constants';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      await authService.forgotPassword(data.email);
      setIsSuccess(true);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Erro ao enviar email. Tente novamente.');
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
        </div>

        <Card>
          {isSuccess ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Email enviado!</h2>
              <p className="text-gray-500 mb-6">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
              <Link to={ROUTES.LOGIN}>
                <Button variant="outline" className="w-full">
                  Voltar para o login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">Esqueceu sua senha?</h2>
              <p className="text-gray-500 mb-6">
                Digite seu email e enviaremos instruções para redefinir sua senha.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Enviar instruções
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
