import { AppLayout } from '@/app/layout';
import { Button, ButtonGroup, Grid, GridContainer, Link } from '@trussworks/react-uswds';

export function NotFoundPage() {
  // const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // const identifierLinksText = ['About <Parent shortname>', 'Accessibility support', 'FOIA requests', 'No FEAR Act data', 'Office of the Inspector General', 'Performance reports', 'Privacy policy'];

  return (
    <AppLayout>
      <div className="usa-section">
        <GridContainer>
          <Grid row gap>
            <main className="usa-layout-docs__main grid-col-12 desktop:grid-col-9 usa-prose usa-layout-docs" id="main-content">
              <h2>Page not found</h2>

              <p className="usa-intro">
                We’re sorry, we can’t find the page you&apos;re looking for. It
                might have been removed, changed its name, or is otherwise
                unavailable.
              </p>

              <p>
                If you typed the URL directly, check your spelling and
                capitalization. Our URLs look like this:
                <strong>{' <agency.gov/example-one>'}</strong>.
              </p>

              <p>
                Visit our homepage for helpful tools and resources, or contact
                us and we’ll point you in the right direction.
              </p>

              <div className="margin-y-5">
                <ButtonGroup>
                  <Button type="button">Visit homepage</Button>
                  <Button type="button" outline>
                    Contact Us
                  </Button>
                </ButtonGroup>
              </div>

              <p>For immediate assistance:</p>

              <ul>
                <li>
                  <Link href="javascript:void()">
                    Start a live chat with us
                  </Link>
                </li>

                <li>
                  Call
                  <Link href="javascript:void()"> (555) 555-GOVT</Link>
                </li>
              </ul>

              <p className="text-base">
                <strong>Error code:</strong> 404
              </p>
            </main>
          </Grid>
        </GridContainer>
      </div>
    </AppLayout>
  )   
}