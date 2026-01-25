import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Fieldset,
  Form,
  Grid,
  GridContainer,
  Label,
  Modal,
  ModalFooter,
  ModalToggleButton,
  type ModalRef,
  Radio,
  Select,
} from '@trussworks/react-uswds';

import { useAuth } from '@/shared/hooks/auth-queries';
import { UserRole } from '@/shared/domain/enums';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getDemoUsers, resetDemoData } from '@/shared/api/demo-api';
import { queryClient } from '@/shared/hooks/queryClient';

const demoLoginSchema = z.object({
  role: z.nativeEnum(UserRole),
  email: z.string().email('Select a valid user'),
  password: z.string().min(1),
});

type DemoLoginValues = z.infer<typeof demoLoginSchema>;

export function DemoLoginPage() {
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const resetModalRef = useRef<ModalRef>(null);

  const { data: users = [] } = useQuery({
    queryKey: ['demo-users'],
    queryFn: getDemoUsers,
  });

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        role === UserRole.USER ? user.role === UserRole.USER : user.role === UserRole.ADMIN,
      ),
    [users, role],
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<DemoLoginValues>({
    resolver: zodResolver(demoLoginSchema),
    defaultValues: {
      role: UserRole.USER,
      email: '',
      password: 'secret123',
    },
  });

  const selectedEmail = useWatch({ control, name: 'email' });

  useEffect(() => {
    setValue('role', role);
  }, [role, setValue]);

  useEffect(() => {
    if (!users.length || selectedEmail) {
      return;
    }
    const defaultUser = users.find((user) => user.role === role);
    if (defaultUser) {
      setValue('email', defaultUser.email);
    }
  }, [users, role, selectedEmail, setValue]);

  const handleRoleChange = (nextRole: UserRole) => {
    setRole(nextRole);
    const firstUser = users.find((user) => user.role === nextRole);
    setValue('role', nextRole, { shouldValidate: true });
    setValue('email', firstUser?.email ?? '', { shouldValidate: true });
  };

  async function onSubmit(values: DemoLoginValues) {
    await login(values);
  }

  const resetMutation = useMutation({
    mutationFn: async () => {
      await resetDemoData();
      await queryClient.invalidateQueries({ queryKey: ['demo-users'] });
      await queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onSuccess: () => {
      resetModalRef.current?.toggleModal();
    },
  });

  async function handleResetConfirm() {
    try {
      await resetMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to reset demo data', error);
      alert('Reset failed. Please try again.');
    }
  }

  return (
    <main id="main-content">
      <GridContainer className="usa-section">
        <Grid row className="flex-justify-center">
          <Grid col={12} tablet={{ col: 8 }} desktop={{ col: 6 }}>
            <div className="bg-white padding-y-3 padding-x-5 border border-base-lighter">
              <h2 className="margin-bottom-0">Demo Login</h2>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Fieldset legend="Select role and user" legendStyle="large">
                  <input type="hidden" {...register('role')} value={role} readOnly />
                  <input type="hidden" {...register('password')} value="secret123" readOnly />

                  <Label htmlFor="demo-role-selector">Role</Label>
                  <div className="display-flex flex-row flex-gap-2 margin-bottom-2" id="demo-role-selector">
                    <Radio
                      id="demo-role-pa"
                      name="role"
                      value={UserRole.USER}
                      checked={role === UserRole.USER}
                      onChange={() => handleRoleChange(UserRole.USER)}
                      label="User"
                      className="margin-right-2 width-auto"
                    />
                    <Radio
                      id="demo-role-state"
                      name="role"
                      value={UserRole.ADMIN}
                      checked={role === UserRole.ADMIN}
                      onChange={() => handleRoleChange(UserRole.ADMIN)}
                      label="Admin"
                      className="width-auto"
                    />
                  </div>

                  <Label htmlFor="demo-email">User</Label>
                  <Select id="demo-email" {...register('email')} disabled={!filteredUsers.length}>
                    <option value="">Select a user</option>
                    {filteredUsers.map((user) => (
                      <option key={user.id} value={user.email}>
                        {`${user.firstName} ${user.lastName}`.trim()}
                      </option>
                    ))}
                  </Select>
                  {errors.email && <span className="text-red">{errors.email.message}</span>}

                  <Button type="submit" className="margin-top-2" disabled={!selectedEmail}>
                    Login as selected user
                  </Button>
                </Fieldset>
              </Form>
            </div>
            <div className="margin-top-2 display-flex flex-justify-center flex-gap-2">
              <Button
                type="button"
                style={{ backgroundColor: '#b50909', borderColor: '#b50909' }}
                className="text-white"
                onClick={() => resetModalRef.current?.toggleModal()}
              >
                Reset Data
              </Button>              
            </div>
          </Grid>
        </Grid>
      </GridContainer>
      <Modal
        ref={resetModalRef}
        id="reset-demo-modal"
        aria-labelledby="reset-demo-modal-heading"
        forceAction        
      >
        <h2 id="reset-demo-modal-heading" className="margin-top-0" tabIndex={-1}>
          Confirm Reset
        </h2>
        <p>
          This will remove any data that was created in this demo
          application and reset to the original state. Are you sure you want to proceed?
        </p>
        <ModalFooter>
          <ModalToggleButton modalRef={resetModalRef} type="button" outline>
            Cancel
          </ModalToggleButton>
          <Button type="button" onClick={handleResetConfirm} disabled={resetMutation.isPending}>
            {resetMutation.isPending ? 'Resetting…' : 'Yes, reset data'}
          </Button>
        </ModalFooter>
      </Modal>
    </main>
  );
}
