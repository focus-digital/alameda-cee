import { useAuth } from "@/shared/hooks/auth-queries";
import { Button, Fieldset, Form, Grid, GridContainer, Label, Link, TextInput } from "@trussworks/react-uswds";
import { useState } from "react";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'jdoe@example.com',
      password: 'secret123',
    },
  });

  async function submit(values: LoginFormValues) {
    await login(values);
  }

  return (
    <main id="main-content">
        <div className="bg-white">
          <GridContainer className="usa-section">
            <Grid row={true} className="flex-justify-center">
              <Grid col={12} tablet={{
              col: 8
            }} desktop={{
              col: 6
            }}>
                <div className="bg-white padding-y-3 padding-x-5 border border-base-lighter">
                  <h2 className="margin-bottom-0">Sign in</h2>
                  <Form onSubmit={handleSubmit(submit)}>
                    <Fieldset legend="Access your account" legendStyle="large">
                      <Label htmlFor="email">Email address</Label>
                      <TextInput
                        id="email"
                        type="email"
                        autoCorrect="off"
                        autoCapitalize="off"
                        required={true}
                        {...register('email')}
                        validationStatus={errors.email ? 'error' : undefined}
                        />

                      <Label htmlFor="password-sign-in">Password</Label>
                      <TextInput
                        id="password-sign-in"
                        type={showPassword ? 'text' : 'password'}
                        autoCorrect="off"
                        autoCapitalize="off"
                        required={true}
                        {...register('password')}
                        validationStatus={errors.password ? 'error' : undefined}
                      />

                      <button title="Show password" type="button" className="usa-show-password" aria-controls="password-sign-in" onClick={(): void => setShowPassword(showPassword => !showPassword)}>
                        {showPassword ? 'Hide password' : 'Show password'}
                      </button>

                      <Button type="submit">Sign in</Button>

                      <p>
                        <Link href="javascript:void();">Forgot password?</Link>
                      </p>
                    </Fieldset>
                  </Form>
                </div>

                <p className="text-center">
                  {"Don't have an account? "}
                  <Link href="javascript:void();">Create your account now</Link>
                  .
                </p>

                {/* <div className="border-top border-base-lighter margin-top-3 padding-top-1">
                  <h2>Are you a federal employee?</h2>
                  <div className="usa-prose">
                    <p>
                      If you are a federal employee or [other secondary user],
                      please use [secondary Single Sign On (SSO)].
                    </p>
                    <p>
                      <Button type="button" outline={true}>
                        Launch secondary SSO
                      </Button>
                    </p>
                  </div>
                </div> */}
              </Grid>
            </Grid>
          </GridContainer>
        </div>
      </main>
  )
}