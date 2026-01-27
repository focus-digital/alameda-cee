import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Button,
  Select,
  Table,
  GridContainer,
  Grid,
  Tag,
} from '@trussworks/react-uswds';
import { useInterests } from '@/shared/hooks/interest-queries';
import { getInterestsExportUrl } from '@/shared/api/interest-api';
import { InterestStatus, AgeRange, CareType } from '@/shared/domain/enums';
import type { Interest } from '@/shared/domain/types';

const statusLabels: Record<InterestStatus, string> = {
  [InterestStatus.NEW]: 'New',
  [InterestStatus.IN_PROGRESS]: 'In Progress',
  [InterestStatus.CONTACTED]: 'Contacted',
  [InterestStatus.CLOSED]: 'Closed',
};

const statusColors: Record<InterestStatus, 'bg-primary' | 'bg-warning' | 'bg-success' | 'bg-base-light'> = {
  [InterestStatus.NEW]: 'bg-primary',
  [InterestStatus.IN_PROGRESS]: 'bg-warning',
  [InterestStatus.CONTACTED]: 'bg-success',
  [InterestStatus.CLOSED]: 'bg-base-light',
};

const ageLabels: Record<AgeRange, string> = {
  [AgeRange.INFANT]: 'Infant',
  [AgeRange.TODDLER]: 'Toddler',
  [AgeRange.PRESCHOOL]: 'Preschool',
  [AgeRange.SCHOOL_AGE]: 'School Age',
};

const careLabels: Record<CareType, string> = {
  [CareType.FULL_DAY]: 'Full Day',
  [CareType.PART_DAY]: 'Part Day',
  [CareType.BEFORE_AFTER_SCHOOL]: 'Before/After',
  [CareType.DROP_IN]: 'Drop-In',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function IntakeDashboardPage() {
  const [statusFilter, setStatusFilter] = useState<InterestStatus | ''>('');
  const { data: interests, isLoading, error } = useInterests(statusFilter || undefined);

  const handleExport = () => {
    window.open(getInterestsExportUrl(), '_blank');
  };

  return (
    <GridContainer>
      <Grid row gap className="margin-top-4">
        <Grid col={12}>
          <h1>Interest Submissions</h1>
          <p className="usa-intro">Review and manage family interest submissions.</p>
        </Grid>
      </Grid>

      <Grid row gap className="margin-bottom-3">
        <Grid col={12} tablet={{ col: 6 }}>
          <label htmlFor="statusFilter" className="usa-label">
            Filter by Status
          </label>
          <Select
            id="statusFilter"
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InterestStatus | '')}
          >
            <option value="">All Statuses</option>
            {Object.values(InterestStatus).map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </Select>
        </Grid>
        <Grid col={12} tablet={{ col: 6 }} className="display-flex flex-align-end">
          <Button type="button" outline onClick={handleExport}>
            Export CSV
          </Button>
        </Grid>
      </Grid>

      {isLoading && <p>Loading submissions...</p>}
      {error && <Alert type="error" headingLevel="h4">Error loading submissions. Please try again.</Alert>}

      {interests && (
        <>
          <p className="margin-bottom-2">
            <strong>{interests.length}</strong> submission{interests.length !== 1 ? 's' : ''} found
          </p>

          {interests.length === 0 ? (
            <Alert type="info" headingLevel="h4">No submissions found.</Alert>
          ) : (
            <div className="usa-table-container--scrollable" tabIndex={0}>
            <Table bordered striped fullWidth>
              <thead>
                <tr>
                  <th scope="col">Provider</th>
                  <th scope="col">Status</th>
                  <th scope="col">Complete</th>
                  <th scope="col">ZIP</th>
                  <th scope="col">Age Range</th>
                  <th scope="col">Care Type</th>
                  <th scope="col">Submitted</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {interests.map((interest: Interest) => (
                  <tr key={interest.id}>
                    <td>{interest.provider?.name ?? 'Unknown'}</td>
                    <td>
                      <Tag className={statusColors[interest.status]}>
                        {statusLabels[interest.status]}
                      </Tag>
                    </td>
                    <td>{interest.isComplete ? 'Yes' : 'No'}</td>
                    <td>{interest.householdZipCode ?? '-'}</td>
                    <td>
                      {interest.childAgeRange ? ageLabels[interest.childAgeRange] : '-'}
                    </td>
                    <td>
                      {interest.careTypePreference
                        ? careLabels[interest.careTypePreference]
                        : '-'}
                    </td>
                    <td>{formatDate(interest.submittedAt)}</td>
                    <td>
                      <Link to={`/admin/interests/${interest.id}`}>
                        <Button type="button" unstyled className="usa-button--unstyled">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            </div>
          )}
        </>
      )}
    </GridContainer>
  );
}
