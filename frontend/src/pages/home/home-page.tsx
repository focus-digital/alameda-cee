import { useAuth } from "@/shared/hooks/auth-queries";
import { Grid, GridContainer } from "@trussworks/react-uswds";
import { Link as RouterLink } from "react-router-dom";
import { useApplications } from "@/shared/hooks/application-queries";
import { ApplicationStatus } from "@/shared/domain/enums";

export function HomePage() {
  const { user } = useAuth();
  const { data: applications = [] } = useApplications();

  const pendingCount = applications.filter((app) => app.status === ApplicationStatus.UNDER_REVIEW).length;
  const closedCount = applications.filter((app) => app.status !== ApplicationStatus.UNDER_REVIEW).length;

  return (
    <div className="usa-section">
      <GridContainer>
        <Grid row gap>
          <main className="usa-layout-docs__main grid-col-12 desktop:grid-col-9 usa-prose usa-layout-docs" id="main-content">
            <h2>Home Page</h2>

            <p>Welcome back, {user?.firstName ?? user?.email}</p>

            <div style={{ border: "1px solid #dfe1e2", borderRadius: "4px", padding: "1rem" }}>
              <h2 className="margin-top-0">Applications summary</h2>
              <p>
                You have {closedCount} applications completed, and {pendingCount} applications pending.
              </p>
              <RouterLink to="/applications">View or Create Application</RouterLink>
            </div>
          </main>
        </Grid>
      </GridContainer>
    </div>
  )   
}
