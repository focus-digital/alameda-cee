import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Grid, GridContainer, Label, Select, Table, DatePicker } from "@trussworks/react-uswds";

import { ApplicationStatus, LeaveType, UserRole } from "@/shared/domain/enums";
import type { Application } from "@/shared/domain/types";
import { useAuth } from "@/shared/hooks/auth-queries";
import {
  useAdjudicateApplication,
  useApplications,
  useSubmitApplication,
  useWithdrawApplication,
} from "@/shared/hooks/application-queries";

function startCase(text: string): string {
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const schema = z
  .object({
    leaveType: z.nativeEnum(LeaveType, { message: "Choose a leave type" }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
  })
  .refine(
    (value) => {
      if (!value.endDate) return true;
      const start = new Date(value.startDate);
      const end = new Date(value.endDate);
      return end >= start;
    },
    { message: "End date cannot be before start date", path: ["endDate"] },
  );

type FormValues = z.infer<typeof schema>;

function toIsoDate(date: string | undefined): string | undefined {
  if (!date) return undefined;
  // Append midnight UTC to avoid timezone drift
  return new Date(date).toISOString();
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString();
}

function groupApplications(applications: Application[] = []) {
  const pending = [];
  const closed = [];
  for (const app of applications) {
    if (app.status === ApplicationStatus.UNDER_REVIEW) {
      pending.push(app);
    } else {
      closed.push(app);
    }
  }
  return { pending, closed };
}

export function ApplicationsPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const { data: applications = [], isLoading } = useApplications();
  const submitMutation = useSubmitApplication();
  const withdrawMutation = useWithdrawApplication();
  const adjudicateMutation = useAdjudicateApplication();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const { pending, closed } = useMemo(() => groupApplications(applications), [applications]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      leaveType: values.leaveType,
      startDate: toIsoDate(values.startDate)!,
      endDate: values.endDate ? toIsoDate(values.endDate) ?? null : undefined,
    };
    await submitMutation.mutateAsync(payload);
    reset();
    setShowForm(false);
  };

  const handleWithdraw = async (id: string) => {
    setActionId(id);
    try {
      await withdrawMutation.mutateAsync(id);
    } finally {
      setActionId(null);
    }
  };

  const handleAdjudicate = async (id: string, status: ApplicationStatus) => {
    setActionId(id);
    try {
      await adjudicateMutation.mutateAsync({ id, status });
    } finally {
      setActionId(null);
    }
  };

  const isUser = user?.role === UserRole.USER;
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <div className="usa-section">
      <GridContainer>
        <Grid row gap>
          <main className="usa-layout-docs__main grid-col-12 desktop:grid-col-9 usa-prose usa-layout-docs" id="main-content">
            <h2>Leave Applications</h2>
            {isUser && (
              <div className="margin-top-1">
                <Button
                  type="button"
                  onClick={() => setShowForm((prev) => !prev)}
                  style={
                    showForm
                      ? undefined
                      : { backgroundColor: '#2e8540', borderColor: '#2e8540' }
                  }
                >
                  {showForm ? "Cancel Application" : "New Application"}
                </Button>
              </div>
            )}

            {isAdmin && <p>Admins can review applications below.</p>}

            {isUser && showForm && (
              <form
                className="usa-form margin-top-2"
                onSubmit={handleSubmit(onSubmit)}
                style={{
                  border: '1px solid #dfe1e2',
                  padding: '1rem',
                  borderRadius: '4px',
                  width: '100%',
                  maxWidth: '100%',
                }}
              >
                <Grid row gap>
                  <Grid col={12} tablet={{ col: 4 }}>
                    <Label htmlFor="leaveType">Leave type</Label>
                    <Select id="leaveType" {...register("leaveType")}>
                      <option value="">Select a leave type</option>
                      {Object.values(LeaveType).map((type) => (
                        <option key={type} value={type}>
                          {startCase(type)}
                        </option>
                      ))}
                    </Select>
                    {errors.leaveType && <span className="text-secondary-dark">{errors.leaveType.message}</span>}
                  </Grid>
                  <Grid col={12} tablet={{ col: 8 }}>
                    <div className="display-flex flex-wrap gap-2">
                      <div style={{ minWidth: '220px', flex: '1 1 auto' }}>
                        <Label htmlFor="startDate">Start date</Label>
                        <Controller
                          control={control}
                          name="startDate"
                          render={({ field }) => (
                            <DatePicker
                              id="startDate"
                              name="startDate"
                              onChange={(value) => field.onChange(value ?? '')}
                              value={field.value}
                              required
                            />
                          )}
                        />
                        {errors.startDate && <span className="text-secondary-dark">{errors.startDate.message}</span>}
                      </div>
                      <div style={{ minWidth: '220px', flex: '1 1 auto' }}>
                        <Label htmlFor="endDate">End date (optional)</Label>
                        <Controller
                          control={control}
                          name="endDate"
                          render={({ field }) => (
                            <DatePicker
                              id="endDate"
                              name="endDate"
                              onChange={(value) => field.onChange(value ?? '')}
                              value={field.value}
                            />
                          )}
                        />
                        {errors.endDate && <span className="text-secondary-dark">{errors.endDate.message}</span>}
                      </div>
                    </div>
                  </Grid>
                </Grid>
                <Button type="submit" disabled={submitMutation.isPending} className="margin-top-2">
                  {submitMutation.isPending ? "Submitting..." : "Submit application"}
                </Button>
              </form>
            )}

            <section className="margin-top-3" style={{ border: '1px solid #dfe1e2', padding: '1rem', borderRadius: '4px' }}>
              <h2 className="margin-top-0">Pending Applications</h2>
              {isLoading ? (
                <p>Loading...</p>
              ) : pending.length === 0 ? (
                <p>No pending applications.</p>
              ) : (
                <div className="table-responsive">
                  <Table fullWidth>
                    <thead>
                      <tr>
                        <th scope="col">Type</th>
                        <th scope="col">Start</th>
                        <th scope="col">End</th>
                        <th scope="col">Status</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pending.map((app) => (
                        <tr key={app.id}>
                          <td>{startCase(app.leaveType)}</td>
                          <td>{formatDate(app.startDate)}</td>
                          <td>{formatDate(app.endDate)}</td>
                          <td>{startCase(app.status)}</td>
                          <td>
                            {isUser && (
                              <Button
                                type="button"
                                className="usa-button"
                                style={{ backgroundColor: '#fdb81e', color: '#1b1b1b', borderColor: '#fdb81e' }}
                                disabled={withdrawMutation.isPending && actionId === app.id}
                                onClick={() => handleWithdraw(app.id)}
                              >
                                {withdrawMutation.isPending && actionId === app.id ? "Withdrawing..." : "Withdraw"}
                              </Button>
                            )}
                            {isAdmin && (
                              <div className="display-flex flex-wrap flex-gap-1">
                                <Button
                                  type="button"
                                  className="usa-button"
                                  style={{ backgroundColor: '#2e8540', borderColor: '#2e8540' }}
                                  disabled={adjudicateMutation.isPending && actionId === app.id}
                                  onClick={() => handleAdjudicate(app.id, ApplicationStatus.APPROVED)}
                                >
                                  {adjudicateMutation.isPending && actionId === app.id ? "Updating..." : "Approve"}
                                </Button>
                                <Button
                                  type="button"
                                  secondary
                                  disabled={adjudicateMutation.isPending && actionId === app.id}
                                  onClick={() => handleAdjudicate(app.id, ApplicationStatus.DENIED)}
                                >
                                  {adjudicateMutation.isPending && actionId === app.id ? "Updating..." : "Deny"}
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </section>

            <section className="margin-top-4" style={{ border: '1px solid #dfe1e2', padding: '1rem', borderRadius: '4px' }}>
              <h2 className="margin-top-0">Closed Applications</h2>
              {isLoading ? (
                <p>Loading...</p>
              ) : closed.length === 0 ? (
                <p>No closed applications.</p>
              ) : (
                <div className="table-responsive">
                  <Table fullWidth>
                    <thead>
                      <tr>
                        <th scope="col">Type</th>
                        <th scope="col">Start</th>
                        <th scope="col">End</th>
                        <th scope="col">Status</th>
                        <th scope="col">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {closed.map((app) => (
                        <tr key={app.id}>
                          <td>{startCase(app.leaveType)}</td>
                          <td>{formatDate(app.startDate)}</td>
                          <td>{formatDate(app.endDate)}</td>
                          <td>{startCase(app.status)}</td>
                          <td>{formatDate(app.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </section>
          </main>
        </Grid>
      </GridContainer>
    </div>
  );
}
