import { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import {
  Alert,
  Button,
  Form,
  FormGroup,
  Grid,
  GridContainer,
  Label,
  Select,
  Textarea,
  TextInput,
} from '@trussworks/react-uswds';
import { useProvider } from '@/shared/hooks/provider-queries';
import { useSubmitInterest } from '@/shared/hooks/interest-queries';
import { ContactMethod, PreferredLanguage, AgeRange, CareType, ProviderType } from '@/shared/domain/enums';

const translations = {
  en: {
    title: 'Express Interest',
    backToSearch: 'Back to Provider Search',
    providerLabel: 'Provider',
    contactMethodLabel: 'Preferred Contact Method',
    contactMethodPhone: 'Phone',
    contactMethodEmail: 'Email',
    contactMethodText: 'Text Message',
    phoneLabel: 'Phone Number',
    emailLabel: 'Email Address',
    languageLabel: 'Preferred Language',
    languageEnglish: 'English',
    languageSpanish: 'Spanish',
    notesLabel: 'Additional Notes',
    notesPlaceholder: 'Any additional information you would like to share...',
    submit: 'Submit',
    submitting: 'Submitting...',
    error: 'There was an error submitting your interest. Please try again.',
    phoneRequired: 'Phone number is required for phone or text contact.',
    phoneInvalidFormat: 'Please enter a valid 10-digit US phone number.',
    emailRequired: 'Email address is required for email contact.',
    screenerInfo: 'Information from Eligibility Screener',
    zipCode: 'ZIP Code',
    childAge: 'Child Age Range',
    careType: 'Care Type',
    householdSize: 'Household Size',
    incomeRange: 'Income Range',
    startDate: 'Desired Start Date',
    typeFamily: 'Family Child Care',
    typeCenter: 'Center-Based',
    loadingProvider: 'Loading provider...',
    providerNotFound: 'Provider not found.',
  },
  es: {
    title: 'Expresar Interés',
    backToSearch: 'Volver a Búsqueda de Proveedores',
    providerLabel: 'Proveedor',
    contactMethodLabel: 'Método de Contacto Preferido',
    contactMethodPhone: 'Teléfono',
    contactMethodEmail: 'Correo Electrónico',
    contactMethodText: 'Mensaje de Texto',
    phoneLabel: 'Número de Teléfono',
    emailLabel: 'Correo Electrónico',
    languageLabel: 'Idioma Preferido',
    languageEnglish: 'Inglés',
    languageSpanish: 'Español',
    notesLabel: 'Notas Adicionales',
    notesPlaceholder: 'Cualquier información adicional que desee compartir...',
    submit: 'Enviar',
    submitting: 'Enviando...',
    error: 'Hubo un error al enviar su interés. Por favor intente de nuevo.',
    phoneRequired: 'El número de teléfono es requerido para contacto por teléfono o texto.',
    phoneInvalidFormat: 'Por favor ingrese un número de teléfono válido de 10 dígitos.',
    emailRequired: 'El correo electrónico es requerido para contacto por correo.',
    screenerInfo: 'Información del Cuestionario de Elegibilidad',
    zipCode: 'Código Postal',
    childAge: 'Rango de Edad del Niño',
    careType: 'Tipo de Cuidado',
    householdSize: 'Tamaño del Hogar',
    incomeRange: 'Rango de Ingresos',
    startDate: 'Fecha de Inicio Deseada',
    typeFamily: 'Cuidado Familiar',
    typeCenter: 'Centro',
    loadingProvider: 'Cargando proveedor...',
    providerNotFound: 'Proveedor no encontrado.',
  },
};

const ageLabels = {
  en: {
    [AgeRange.INFANT]: 'Infant (0-12 months)',
    [AgeRange.TODDLER]: 'Toddler (1-3 years)',
    [AgeRange.PRESCHOOL]: 'Preschool (3-5 years)',
    [AgeRange.SCHOOL_AGE]: 'School Age (5+ years)',
  },
  es: {
    [AgeRange.INFANT]: 'Bebé (0-12 meses)',
    [AgeRange.TODDLER]: 'Niño Pequeño (1-3 años)',
    [AgeRange.PRESCHOOL]: 'Preescolar (3-5 años)',
    [AgeRange.SCHOOL_AGE]: 'Edad Escolar (5+ años)',
  },
};

const careLabels = {
  en: {
    [CareType.FULL_DAY]: 'Full Day',
    [CareType.PART_DAY]: 'Part Day',
    [CareType.BEFORE_AFTER_SCHOOL]: 'Before/After School',
    [CareType.DROP_IN]: 'Drop-In',
  },
  es: {
    [CareType.FULL_DAY]: 'Día Completo',
    [CareType.PART_DAY]: 'Medio Día',
    [CareType.BEFORE_AFTER_SCHOOL]: 'Antes/Después de la Escuela',
    [CareType.DROP_IN]: 'Ocasional',
  },
};

type ScreenerData = {
  zipCode?: string;
  childAgeRange?: AgeRange;
  careTypePreference?: CareType;
  householdSize?: number;
  incomeRange?: string;
  desiredStartDate?: string;
};

export function InterestFormPage() {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const context = useOutletContext<{ language: 'en' | 'es' } | undefined>();
  const language = context?.language ?? 'en';
  const t = translations[language];

  const { data: provider, isLoading: providerLoading, error: providerError } = useProvider(providerId);
  const submitInterest = useSubmitInterest();

  const [screenerData, setScreenerData] = useState<ScreenerData>({});
  const [contactMethod, setContactMethod] = useState<ContactMethod>(ContactMethod.EMAIL);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<PreferredLanguage>(
    language === 'es' ? PreferredLanguage.SPANISH : PreferredLanguage.ENGLISH
  );
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('cee_screener_data');
    if (stored) {
      try {
        setScreenerData(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!provider) return;

    // Validate contact info
    if ((contactMethod === ContactMethod.PHONE || contactMethod === ContactMethod.TEXT) && !phone) {
      setValidationError(t.phoneRequired);
      return;
    }
    const digits = phone.replace(/\D/g, '');
    const validLength = digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
    if ((contactMethod === ContactMethod.PHONE || contactMethod === ContactMethod.TEXT) && !validLength) {
      setValidationError(t.phoneInvalidFormat);
      return;
    }
    if (contactMethod === ContactMethod.EMAIL && !email) {
      setValidationError(t.emailRequired);
      return;
    }

    try {
      await submitInterest.mutateAsync({
        providerId: provider.id,
        householdZipCode: screenerData.zipCode,
        childAgeRange: screenerData.childAgeRange,
        careTypePreference: screenerData.careTypePreference,
        householdSize: screenerData.householdSize,
        incomeRange: screenerData.incomeRange,
        desiredStartDate: screenerData.desiredStartDate,
        contactMethod,
        contactPhone: phone || undefined,
        contactEmail: email || undefined,
        preferredLanguage,
        notes: notes || undefined,
      });

      // Clear screener data after successful submission
      sessionStorage.removeItem('cee_screener_data');

      // Navigate to confirmation page
      navigate('/confirmation', { state: { email: email || undefined, phone: phone || undefined, contactMethod, language } });
    } catch {
      // Error is handled by mutation state
    }
  };

  if (providerLoading) {
    return (
      <GridContainer>
        <Grid row gap>
          <Grid col={12}>
            <p className="margin-top-4">{t.loadingProvider}</p>
          </Grid>
        </Grid>
      </GridContainer>
    );
  }

  if (providerError || !provider) {
    return (
      <GridContainer>
        <Grid row gap>
          <Grid col={12}>
            <Alert type="error" headingLevel="h4" className="margin-top-4">
              {t.providerNotFound}
            </Alert>
            <Button type="button" outline onClick={() => navigate('/providers')} className="margin-top-2">
              {t.backToSearch}
            </Button>
          </Grid>
        </Grid>
      </GridContainer>
    );
  }

  return (
    <GridContainer>
      <Grid row gap>
        <Grid col={12}>
          <Button type="button" unstyled onClick={() => navigate('/providers')} className="margin-top-2">
            &larr; {t.backToSearch}
          </Button>
          <h1 className="margin-top-2">{t.title}</h1>
        </Grid>
      </Grid>

      {/* Provider Info */}
      <Grid row gap>
        <Grid col={12} tablet={{ col: 10 }} desktop={{ col: 8 }}>
          <div className="bg-base-lightest padding-2 radius-md margin-bottom-2">
            <p className="margin-0">
              <strong>{t.providerLabel}:</strong> {provider.name}
            </p>
            <p className="margin-0 text-base">
              {provider.type === ProviderType.FAMILY_CHILD_CARE ? t.typeFamily : t.typeCenter} &bull;{' '}
              {provider.address}, {provider.city}, CA {provider.zipCode}
            </p>
          </div>
        </Grid>
      </Grid>

      {/* Screener Data Summary */}
      {Object.keys(screenerData).length > 0 && (
        <Grid row gap>
          <Grid col={12} tablet={{ col: 10 }} desktop={{ col: 8 }}>
            <div className="border-1px border-base-light padding-2 radius-md margin-bottom-2">
              <p className="margin-0 margin-bottom-1 text-bold">{t.screenerInfo}</p>
              <div className="font-body-2xs">
                {screenerData.zipCode && (
                  <p className="margin-0">
                    {t.zipCode}: {screenerData.zipCode}
                  </p>
                )}
                {screenerData.childAgeRange && (
                  <p className="margin-0">
                    {t.childAge}: {ageLabels[language][screenerData.childAgeRange]}
                  </p>
                )}
                {screenerData.careTypePreference && (
                  <p className="margin-0">
                    {t.careType}: {careLabels[language][screenerData.careTypePreference]}
                  </p>
                )}
                {screenerData.householdSize && (
                  <p className="margin-0">
                    {t.householdSize}: {screenerData.householdSize}
                  </p>
                )}
                {screenerData.incomeRange && (
                  <p className="margin-0">
                    {t.incomeRange}: {screenerData.incomeRange}
                  </p>
                )}
                {screenerData.desiredStartDate && (
                  <p className="margin-0">
                    {t.startDate}: {screenerData.desiredStartDate}
                  </p>
                )}
              </div>
            </div>
          </Grid>
        </Grid>
      )}

      {/* Contact Form */}
      <Grid row gap>
        <Grid col={12} tablet={{ col: 8 }} desktop={{ col: 6 }}>
          <Form onSubmit={handleSubmit}>
            {submitInterest.error && (
              <Alert type="error" headingLevel="h4" slim className="margin-bottom-2">
                {t.error}
              </Alert>
            )}

            {validationError && (
              <Alert type="error" headingLevel="h4" slim className="margin-bottom-2">
                {validationError}
              </Alert>
            )}

            {/* Contact Method */}
            <FormGroup>
              <Label htmlFor="contactMethod">{t.contactMethodLabel}</Label>
              <Select
                id="contactMethod"
                name="contactMethod"
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value as ContactMethod)}
              >
                <option value={ContactMethod.EMAIL}>{t.contactMethodEmail}</option>
                <option value={ContactMethod.PHONE}>{t.contactMethodPhone}</option>
                <option value={ContactMethod.TEXT}>{t.contactMethodText}</option>
              </Select>
            </FormGroup>

            {/* Phone Input */}
            {(contactMethod === ContactMethod.PHONE || contactMethod === ContactMethod.TEXT) && (
              <FormGroup>
                <Label htmlFor="phone">{t.phoneLabel}</Label>
                <TextInput
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </FormGroup>
            )}

            {/* Email Input */}
            {contactMethod === ContactMethod.EMAIL && (
              <FormGroup>
                <Label htmlFor="email">{t.emailLabel}</Label>
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormGroup>
            )}

            {/* Preferred Language */}
            <FormGroup>
              <Label htmlFor="preferredLanguage">{t.languageLabel}</Label>
              <Select
                id="preferredLanguage"
                name="preferredLanguage"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as PreferredLanguage)}
              >
                <option value={PreferredLanguage.ENGLISH}>{t.languageEnglish}</option>
                <option value={PreferredLanguage.SPANISH}>{t.languageSpanish}</option>
              </Select>
            </FormGroup>

            {/* Notes */}
            <FormGroup>
              <Label htmlFor="notes">{t.notesLabel}</Label>
              <Textarea
                id="notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.notesPlaceholder}
              />
            </FormGroup>

            <Button type="submit" disabled={submitInterest.isPending} className="margin-top-2">
              {submitInterest.isPending ? t.submitting : t.submit}
            </Button>
          </Form>
        </Grid>
      </Grid>
    </GridContainer>
  );
}
