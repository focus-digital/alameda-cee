import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Label,
  Select,
  Textarea,
  GridContainer,
  Grid,
  Tag,
} from '@trussworks/react-uswds';
import {
  useInterest,
  useUpdateInterestStatus,
  useAddInterestNote,
} from '@/shared/hooks/interest-queries';
import {
  InterestStatus,
  AgeRange,
  CareType,
  ContactMethod,
  PreferredLanguage,
  ProviderType,
} from '@/shared/domain/enums';

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
  [AgeRange.INFANT]: 'Infant (0-12 months)',
  [AgeRange.TODDLER]: 'Toddler (1-3 years)',
  [AgeRange.PRESCHOOL]: 'Preschool (3-5 years)',
  [AgeRange.SCHOOL_AGE]: 'School Age (5+ years)',
};

const careLabels: Record<CareType, string> = {
  [CareType.FULL_DAY]: 'Full Day',
  [CareType.PART_DAY]: 'Part Day',
  [CareType.BEFORE_AFTER_SCHOOL]: 'Before/After School',
  [CareType.DROP_IN]: 'Drop-In',
};

const contactMethodLabels: Record<ContactMethod, string> = {
  [ContactMethod.PHONE]: 'Phone',
  [ContactMethod.EMAIL]: 'Email',
  [ContactMethod.TEXT]: 'Text Message',
};

const languageLabels: Record<PreferredLanguage, string> = {
  [PreferredLanguage.ENGLISH]: 'English',
  [PreferredLanguage.SPANISH]: 'Spanish',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function InterestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: interest, isLoading, error } = useInterest(id);
  const updateStatus = useUpdateInterestStatus();
  const addNote = useAddInterestNote();

  const [newNote, setNewNote] = useState('');

  const handleStatusChange = async (newStatus: InterestStatus) => {
    if (!id) return;
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
    } catch {
      // Error handled by mutation state
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newNote.trim()) return;
    try {
      await addNote.mutateAsync({ interestId: id, content: newNote.trim() });
      setNewNote('');
    } catch {
      // Error handled by mutation state
    }
  };

  if (isLoading) {
    return (
      <GridContainer>
        <p className="margin-top-4">Loading...</p>
      </GridContainer>
    );
  }

  if (error || !interest) {
    return (
      <GridContainer>
        <Alert type="error" headingLevel="h4" className="margin-top-4">
          Error loading interest details. Please try again.
        </Alert>
        <Link to="/admin/dashboard" className="margin-top-2 display-inline-block">
          Back to Dashboard
        </Link>
      </GridContainer>
    );
  }

  return (
    <GridContainer>
      <Grid row gap className="margin-top-4">
        <Grid col={12}>
          <Link to="/admin/dashboard" className="usa-link">
            &larr; Back to Dashboard
          </Link>
          <h1 className="margin-top-2">Interest Submission Details</h1>
        </Grid>
      </Grid>

      <Grid row gap>
        {/* Main Details */}
        <Grid col={12} desktop={{ col: 8 }}>
          {/* Status Section */}
          <Card className="margin-bottom-3">
            <CardHeader>
              <h2 className="usa-card__heading">Status</h2>
            </CardHeader>
            <CardBody>
              <div className="display-flex flex-align-center gap-2">
                <Tag className={statusColors[interest.status]}>
                  {statusLabels[interest.status]}
                </Tag>
              </div>

              <FormGroup className="margin-top-3">
                <Label htmlFor="statusUpdate">Update Status</Label>
                <Select
                  id="statusUpdate"
                  name="statusUpdate"
                  value={interest.status}
                  onChange={(e) => handleStatusChange(e.target.value as InterestStatus)}
                  disabled={updateStatus.isPending}
                >
                  {Object.values(InterestStatus).map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              {updateStatus.error && (
                <Alert type="error" headingLevel="h4" slim className="margin-top-2">
                  Error updating status. Please try again.
                </Alert>
              )}
            </CardBody>
          </Card>

          {/* Provider Info */}
          <Card className="margin-bottom-3">
            <CardHeader>
              <h2 className="usa-card__heading">Provider</h2>
            </CardHeader>
            <CardBody>
              {interest.provider ? (
                <>
                  <p className="margin-0">
                    <strong>{interest.provider.name}</strong>
                  </p>
                  <p className="margin-0 text-base">
                    {interest.provider.type === ProviderType.FAMILY_CHILD_CARE
                      ? 'Family Child Care'
                      : 'Center-Based'}
                  </p>
                  <p className="margin-0">
                    {interest.provider.address}, {interest.provider.city}, CA{' '}
                    {interest.provider.zipCode}
                  </p>
                  {interest.provider.phone && (
                    <p className="margin-0">Phone: {interest.provider.phone}</p>
                  )}
                </>
              ) : (
                <p className="margin-0 text-base">Provider information not available</p>
              )}
            </CardBody>
          </Card>

          {/* Family Info */}
          <Card className="margin-bottom-3">
            <CardHeader>
              <h2 className="usa-card__heading">Family Information</h2>
            </CardHeader>
            <CardBody>
              <dl className="usa-list usa-list--unstyled">
                <div className="margin-bottom-1">
                  <dt className="text-bold display-inline">Household ZIP Code: </dt>
                  <dd className="display-inline">{interest.householdZipCode ?? 'Not provided'}</dd>
                </div>
                <div className="margin-bottom-1">
                  <dt className="text-bold display-inline">Child Age Range: </dt>
                  <dd className="display-inline">
                    {interest.childAgeRange ? ageLabels[interest.childAgeRange] : 'Not provided'}
                  </dd>
                </div>
                <div className="margin-bottom-1">
                  <dt className="text-bold display-inline">Care Type Preference: </dt>
                  <dd className="display-inline">
                    {interest.careTypePreference
                      ? careLabels[interest.careTypePreference]
                      : 'Not provided'}
                  </dd>
                </div>
                <div className="margin-bottom-1">
                  <dt className="text-bold display-inline">Household Size: </dt>
                  <dd className="display-inline">{interest.householdSize ?? 'Not provided'}</dd>
                </div>
                <div className="margin-bottom-1">
                  <dt className="text-bold display-inline">Income Range: </dt>
                  <dd className="display-inline">{interest.incomeRange ?? 'Not provided'}</dd>
                </div>
                <div className="margin-bottom-1">
                  <dt className="text-bold display-inline">Desired Start Date: </dt>
                  <dd className="display-inline">
                    {interest.desiredStartDate
                      ? formatDateShort(interest.desiredStartDate)
                      : 'Not provided'}
                  </dd>
                </div>
                {interest.eligibilityIndicator && (
                  <div className="margin-bottom-1">
                    <dt className="text-bold display-inline">Eligibility Indicator: </dt>
                    <dd className="display-inline">{interest.eligibilityIndicator}</dd>
                  </div>
                )}
              </dl>
            </CardBody>
          </Card>

          {/* Contact Info */}
          <Card className="margin-bottom-3">
            <CardHeader>
              <h2 className="usa-card__heading">Contact Information</h2>
            </CardHeader>
            <CardBody>
              <dl className="usa-list usa-list--unstyled">
                <div className="margin-bottom-1">
                  <dt className="text-bold display-inline">Preferred Contact Method: </dt>
                  <dd className="display-inline">
                    {interest.contactMethod
                      ? contactMethodLabels[interest.contactMethod]
                      : 'Not provided'}
                  </dd>
                </div>
                <div className="margin-bottom-1">
                  <dt className="text-bold display-inline">Phone: </dt>
                  <dd className="display-inline">{interest.contactPhone ?? 'Not provided'}</dd>
                </div>
                <div className="margin-bottom-1">
                  <dt className="text-bold display-inline">Email: </dt>
                  <dd className="display-inline">{interest.contactEmail ?? 'Not provided'}</dd>
                </div>
                <div className="margin-bottom-1">
                  <dt className="text-bold display-inline">Preferred Language: </dt>
                  <dd className="display-inline">{languageLabels[interest.preferredLanguage]}</dd>
                </div>
              </dl>

              {interest.notes && (
                <div className="margin-top-2 padding-2 bg-base-lightest">
                  <p className="text-bold margin-0">Family Notes:</p>
                  <p className="margin-0">{interest.notes}</p>
                </div>
              )}
            </CardBody>
          </Card>
        </Grid>

        {/* Notes Sidebar */}
        <Grid col={12} desktop={{ col: 4 }}>
          <Card>
            <CardHeader>
              <h2 className="usa-card__heading">Admin Notes</h2>
            </CardHeader>
            <CardBody>
              {/* Add Note Form */}
              <Form onSubmit={handleAddNote}>
                <FormGroup>
                  <Label htmlFor="newNote">Add Note</Label>
                  <Textarea
                    id="newNote"
                    name="newNote"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter note..."
                  />
                </FormGroup>
                <Button type="submit" disabled={addNote.isPending || !newNote.trim()}>
                  {addNote.isPending ? 'Adding...' : 'Add Note'}
                </Button>
              </Form>

              {addNote.error && (
                <Alert type="error" headingLevel="h4" slim className="margin-top-2">
                  Error adding note. Please try again.
                </Alert>
              )}

              {/* Notes List */}
              <div className="margin-top-3">
                {interest.adminNotes && interest.adminNotes.length > 0 ? (
                  <ul className="usa-list usa-list--unstyled">
                    {interest.adminNotes.map((note) => (
                      <li
                        key={note.id}
                        className="padding-2 border-bottom border-base-light margin-bottom-1"
                      >
                        <p className="margin-0">{note.content}</p>
                        <p className="margin-0 text-base font-body-2xs">
                          {formatDate(note.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-base">No notes yet.</p>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Metadata */}
          <Card className="margin-top-3">
            <CardHeader>
              <h3 className="usa-card__heading">Submission Details</h3>
            </CardHeader>
            <CardBody>
              <p className="margin-0 font-body-2xs">
                <strong>Submitted:</strong> {formatDate(interest.submittedAt)}
              </p>
              <p className="margin-0 font-body-2xs">
                <strong>Last Updated:</strong> {formatDate(interest.updatedAt)}
              </p>
              <p className="margin-0 font-body-2xs">
                <strong>ID:</strong> {interest.id}
              </p>
            </CardBody>
          </Card>
        </Grid>
      </Grid>
    </GridContainer>
  );
}
