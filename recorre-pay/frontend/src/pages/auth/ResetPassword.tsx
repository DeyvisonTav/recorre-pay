import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../../services';
import { useToast } from '../../contexts/ToastContext';
import { Button, Input, Card } from '../../components/ui';
import { APP_NAME, ROUTES } from '../../utils/constants';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      showError('Token de redefinição não encontrado');
    }
    setToken(tokenParam);
  }, [searchParams, showError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      showError('Token de redefinição não encontrado');
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword(token, data.password);
      setIsSuccess(true);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Erro ao redefinir senha. O link pode ter expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600">{APP_NAME}</h1>
          </div>

          <Card>
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-danger-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Link inválido</h2>
              <p className="text-gray-500 mb-6">
                O link de redefinição de senha é inválido ou expirou.
              </p>
              <Link to={ROUTES.FORGOT_PASSWORD}>
                <Button variant="outline" className="w-full">
                  Solicitar novo link
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">{APP_NAME}</h1>
        </div>

        <Card>
          {isSuccess ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Senha alterada!</h2>
              <p className="text-gray-500 mb-6">
                Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.
              </p>
              <Link to={ROUTES.LOGIN}>
                <Button className="w-full">
                  Ir para o login
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
                Voltar para o login
              </Link>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">Redefinir senha</h2>
              <p className="text-gray-500 mb-6">
                Digite sua nova senha abaixo.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Nova senha"
                  type="password"
                  placeholder="******"
                  error={errors.password?.message}
                  {...register('password')}
                />

                <Input
                  label="Confirmar senha"
                  type="password"
                  placeholder="******"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Redefinir senha
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
