import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { Form } from '../../components/form/Form';
import { FormInput } from '../../components/form/FormInput';
import { FormCheckbox } from '../../components/form/FormCheckbox';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { loginSchema, LoginSchemaType } from '../../schemas/auth.schema';
import { useLogin } from '../../hooks/auth/useAuthMutations';
import { storage } from '../../utils/storage';

const REMEMBERED_EMAIL_KEY = 'digi_remembered_email';

export const LoginPage: React.FC = () => {
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const location = useLocation();

  const rememberedEmail = storage.get<string>(REMEMBERED_EMAIL_KEY, 'admin@digilocal.com');
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (values: LoginSchemaType) => {
    try {
      if (values.rememberMe) {
        storage.set(REMEMBERED_EMAIL_KEY, values.email);
      } else {
        storage.remove(REMEMBERED_EMAIL_KEY);
      }

      await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      navigate(from, { replace: true });
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Card className="shadow-xl border-[var(--border)] bg-[var(--card)]">
      <CardHeader className="space-y-1.5 pb-4 text-center">
        <CardTitle className="font-serif text-3xl font-bold">Sign In</CardTitle>
        <CardDescription className="font-mono-meta text-[10px] text-[var(--gold)] font-semibold tracking-widest">
          ENTERPRISE ACCESS PORTAL
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={loginSchema}
          onSubmit={handleSubmit}
          options={{
            defaultValues: {
              email: rememberedEmail,
              password: 'password123',
              rememberMe: Boolean(rememberedEmail),
            },
          }}
        >
          {() => (
            <div className="space-y-4 font-body">
              <FormInput
                name="email"
                label="Work Email"
                placeholder="name@digilocal.com"
                type="email"
                required
                leftIcon={<Mail className="h-4 w-4 text-[var(--muted-foreground)]" />}
              />

              <FormInput
                name="password"
                label="Password"
                placeholder="••••••••"
                type="password"
                required
                leftIcon={<Lock className="h-4 w-4 text-[var(--muted-foreground)]" />}
              />

              <div className="flex items-center justify-between">
                <FormCheckbox name="rememberMe" label="Remember device" />
                <Link to="/auth/forgot-password" className="text-xs text-[var(--gold)] hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="default"
                className="w-full mt-2"
                isLoading={loginMutation.isPending}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Sign In to Dashboard
              </Button>
            </div>
          )}
        </Form>
      </CardContent>
    </Card>
  );
};
