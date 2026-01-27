import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Alert,
  Button,
  Fieldset,
  Form,
  FormGroup,
  Grid,
  GridContainer,
  Label,
  Radio,
  Select,
  StepIndicator,
  StepIndicatorStep,
  TextInput,
} from '@trussworks/react-uswds';
import { AgeRange, CareType } from '@/shared/domain/enums';

type ScreenerData = {
  zipCode: string;
  childAgeRange: AgeRange | '';
  careTypePreference: CareType | '';
  householdSize: string;
  incomeRange: string;
  desiredStartDate: string;
};

const translations = {
  en: {
    title: 'Child Care Eligibility Screener',
    subtitle: 'Answer a few questions to see if you may qualify for subsidized child care.',
    illustrativeNote: 'This screener provides illustrative results only. It does not determine actual eligibility, approval, or enrollment.',
    step1Title: 'Location',
    step2Title: 'Child Info',
    step3Title: 'Household',
    step4Title: 'Results',
    zipLabel: 'What is your ZIP code?',
    zipHint: 'Enter a 5-digit ZIP code in Alameda County',
    zipError: 'Please enter a valid Alameda County ZIP code.',
    ageLabel: 'What is the age of the child needing care?',
    ageInfant: 'Infant (0-12 months)',
    ageToddler: 'Toddler (1-2 years)',
    agePreschool: 'Preschool (3-5 years)',
    ageSchoolAge: 'School Age (6+ years)',
    careTypeLabel: 'What type of care do you prefer?',
    careFullDay: 'Full Day',
    carePartDay: 'Part Day',
    careBeforeAfter: 'Before/After School',
    careDropIn: 'Drop-In',
    householdSizeLabel: 'How many people are in your household?',
    incomeLabel: 'What is your approximate household income?',
    incomeUnder30: 'Under $30,000',
    income30to50: '$30,000 - $50,000',
    income50to75: '$50,000 - $75,000',
    income75to100: '$75,000 - $100,000',
    incomeOver100: 'Over $100,000',
    startDateLabel: 'When do you need child care to start?',
    next: 'Next',
    back: 'Back',
    seeResults: 'See Results',
    resultsTitle: 'Your Screening Results',
    likelyEligible: 'Based on your responses, you may be eligible for subsidized child care programs.',
    needsReview: 'Based on your responses, your eligibility may require additional review.',
    nextStepsTitle: 'Next Steps',
    nextSteps: 'Search for child care providers in your area and express interest in a program. A subsidy administrator will follow up to discuss your options.',
    findProviders: 'Find Providers',
  },
  es: {
    title: 'Evaluador de Elegibilidad para Cuidado Infantil',
    subtitle: 'Responda algunas preguntas para ver si puede calificar para cuidado infantil subsidiado.',
    illustrativeNote: 'Este evaluador proporciona resultados ilustrativos solamente. No determina elegibilidad, aprobacion o inscripcion real.',
    step1Title: 'Ubicacion',
    step2Title: 'Info del Nino',
    step3Title: 'Hogar',
    step4Title: 'Resultados',
    zipLabel: 'Cual es su codigo postal?',
    zipHint: 'Ingrese un codigo postal de 5 digitos en el Condado de Alameda',
    zipError: 'Por favor ingrese un codigo postal valido del Condado de Alameda.',
    ageLabel: 'Cual es la edad del nino que necesita cuidado?',
    ageInfant: 'Bebe (0-12 meses)',
    ageToddler: 'Nino pequeno (1-2 anos)',
    agePreschool: 'Preescolar (3-5 anos)',
    ageSchoolAge: 'Edad Escolar (6+ anos)',
    careTypeLabel: 'Que tipo de cuidado prefiere?',
    careFullDay: 'Dia Completo',
    carePartDay: 'Medio Dia',
    careBeforeAfter: 'Antes/Despues de la Escuela',
    careDropIn: 'Ocasional',
    householdSizeLabel: 'Cuantas personas hay en su hogar?',
    incomeLabel: 'Cual es el ingreso aproximado de su hogar?',
    incomeUnder30: 'Menos de $30,000',
    income30to50: '$30,000 - $50,000',
    income50to75: '$50,000 - $75,000',
    income75to100: '$75,000 - $100,000',
    incomeOver100: 'Mas de $100,000',
    startDateLabel: 'Cuando necesita que comience el cuidado infantil?',
    next: 'Siguiente',
    back: 'Atras',
    seeResults: 'Ver Resultados',
    resultsTitle: 'Sus Resultados de Evaluacion',
    likelyEligible: 'Segun sus respuestas, puede ser elegible para programas de cuidado infantil subsidiado.',
    needsReview: 'Segun sus respuestas, su elegibilidad puede requerir revision adicional.',
    nextStepsTitle: 'Proximos Pasos',
    nextSteps: 'Busque proveedores de cuidado infantil en su area y exprese interes en un programa. Un administrador de subsidios se comunicara para discutir sus opciones.',
    findProviders: 'Buscar Proveedores',
  },
};

const alamedaZips = [
  '94501', '94502', '94536', '94537', '94538', '94539', '94540', '94541', '94542', '94543',
  '94544', '94545', '94546', '94550', '94551', '94552', '94555', '94557', '94560', '94566',
  '94568', '94577', '94578', '94579', '94580', '94582', '94583', '94586', '94587', '94588',
  '94601', '94602', '94603', '94604', '94605', '94606', '94607', '94608', '94609', '94610',
  '94611', '94612', '94613', '94614', '94615', '94617', '94618', '94619', '94620', '94621',
  '94622', '94623', '94624', '94625', '94627', '94649', '94659', '94660', '94661', '94662',
  '94666', '94701', '94702', '94703', '94704', '94705', '94706', '94707', '94708', '94709',
  '94710', '94712', '94720',
];

export function EligibilityScreenerPage() {
  const context = useOutletContext<{ language: 'en' | 'es' } | undefined>();
  const language = context?.language ?? 'en';
  const t = translations[language];
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [data, setData] = useState<ScreenerData>({
    zipCode: '',
    childAgeRange: '',
    careTypePreference: '',
    householdSize: '',
    incomeRange: '',
    desiredStartDate: '',
  });

  const updateData = (field: keyof ScreenerData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const isZipComplete = data.zipCode.length === 5;
  const isZipInAlameda = alamedaZips.includes(data.zipCode);
  const isStep1Valid = isZipComplete && isZipInAlameda;
  const isStep2Valid = data.childAgeRange !== '' && data.careTypePreference !== '';
  const isStep3Valid = data.householdSize !== '' && data.incomeRange !== '';

  const calculateEligibility = (): 'LIKELY_ELIGIBLE' | 'NEEDS_REVIEW' => {
    const isInAlameda = alamedaZips.includes(data.zipCode);
    const incomeIndex = ['Under $30,000', '$30,000 - $50,000', '$50,000 - $75,000', '$75,000 - $100,000', 'Over $100,000'].indexOf(data.incomeRange);
    const householdSize = parseInt(data.householdSize) || 1;

    // Simple illustrative logic - not real eligibility determination
    if (isInAlameda && incomeIndex <= 2 && householdSize >= 2) {
      return 'LIKELY_ELIGIBLE';
    }
    return 'NEEDS_REVIEW';
  };

  const handleSubmit = () => {
    const eligibility = calculateEligibility();
    const screenerData = {
      ...data,
      eligibilityIndicator: eligibility,
    };
    sessionStorage.setItem('cee_screener_data', JSON.stringify(screenerData));
    setStep(4);
  };

  const handleFindProviders = () => {
    navigate('/providers');
  };

  return (
    <GridContainer>
      <Grid row gap>
        <Grid col={12}>
          <h1 className="margin-top-4">{t.title}</h1>
          <p className="usa-intro">{t.subtitle}</p>

          <Alert type="info" headingLevel="h4" slim className="margin-bottom-4">
            {t.illustrativeNote}
          </Alert>

          <StepIndicator headingLevel="h4" className="margin-bottom-4">
            <StepIndicatorStep label={t.step1Title} status={step > 1 ? 'complete' : step === 1 ? 'current' : undefined} />
            <StepIndicatorStep label={t.step2Title} status={step > 2 ? 'complete' : step === 2 ? 'current' : undefined} />
            <StepIndicatorStep label={t.step3Title} status={step > 3 ? 'complete' : step === 3 ? 'current' : undefined} />
            <StepIndicatorStep label={t.step4Title} status={step === 4 ? 'current' : undefined} />
          </StepIndicator>

          {step === 1 && (
            <Form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
              <Fieldset legend={t.step1Title} legendStyle="large">
                <FormGroup error={isZipComplete && !isZipInAlameda}>
                  <Label htmlFor="zipCode">{t.zipLabel}</Label>
                  <span className="usa-hint">{t.zipHint}</span>
                  {isZipComplete && !isZipInAlameda && (
                    <span className="usa-error-message" role="alert">{t.zipError}</span>
                  )}
                  <TextInput
                    id="zipCode"
                    name="zipCode"
                    type="text"
                    maxLength={5}
                    value={data.zipCode}
                    onChange={(e) => updateData('zipCode', e.target.value.replace(/\D/g, ''))}
                    validationStatus={isZipComplete && !isZipInAlameda ? 'error' : undefined}
                  />
                </FormGroup>
              </Fieldset>
              <Button type="submit" disabled={!isStep1Valid}>{t.next}</Button>
            </Form>
          )}

          {step === 2 && (
            <Form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
              <Fieldset legend={t.step2Title} legendStyle="large">
                <FormGroup>
                  <Label htmlFor="childAgeRange">{t.ageLabel}</Label>
                  <Radio
                    id="age-infant"
                    name="childAgeRange"
                    label={t.ageInfant}
                    value={AgeRange.INFANT}
                    checked={data.childAgeRange === AgeRange.INFANT}
                    onChange={(e) => updateData('childAgeRange', e.target.value)}
                  />
                  <Radio
                    id="age-toddler"
                    name="childAgeRange"
                    label={t.ageToddler}
                    value={AgeRange.TODDLER}
                    checked={data.childAgeRange === AgeRange.TODDLER}
                    onChange={(e) => updateData('childAgeRange', e.target.value)}
                  />
                  <Radio
                    id="age-preschool"
                    name="childAgeRange"
                    label={t.agePreschool}
                    value={AgeRange.PRESCHOOL}
                    checked={data.childAgeRange === AgeRange.PRESCHOOL}
                    onChange={(e) => updateData('childAgeRange', e.target.value)}
                  />
                  <Radio
                    id="age-schoolage"
                    name="childAgeRange"
                    label={t.ageSchoolAge}
                    value={AgeRange.SCHOOL_AGE}
                    checked={data.childAgeRange === AgeRange.SCHOOL_AGE}
                    onChange={(e) => updateData('childAgeRange', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="careTypePreference">{t.careTypeLabel}</Label>
                  <Radio
                    id="care-fullday"
                    name="careTypePreference"
                    label={t.careFullDay}
                    value={CareType.FULL_DAY}
                    checked={data.careTypePreference === CareType.FULL_DAY}
                    onChange={(e) => updateData('careTypePreference', e.target.value)}
                  />
                  <Radio
                    id="care-partday"
                    name="careTypePreference"
                    label={t.carePartDay}
                    value={CareType.PART_DAY}
                    checked={data.careTypePreference === CareType.PART_DAY}
                    onChange={(e) => updateData('careTypePreference', e.target.value)}
                  />
                  <Radio
                    id="care-beforeafter"
                    name="careTypePreference"
                    label={t.careBeforeAfter}
                    value={CareType.BEFORE_AFTER_SCHOOL}
                    checked={data.careTypePreference === CareType.BEFORE_AFTER_SCHOOL}
                    onChange={(e) => updateData('careTypePreference', e.target.value)}
                  />
                  <Radio
                    id="care-dropin"
                    name="careTypePreference"
                    label={t.careDropIn}
                    value={CareType.DROP_IN}
                    checked={data.careTypePreference === CareType.DROP_IN}
                    onChange={(e) => updateData('careTypePreference', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="desiredStartDate">{t.startDateLabel}</Label>
                  <input
                    className="usa-input"
                    id="desiredStartDate"
                    name="desiredStartDate"
                    type="date"
                    value={data.desiredStartDate}
                    onChange={(e) => updateData('desiredStartDate', e.target.value)}
                  />
                </FormGroup>
              </Fieldset>
              <div className="display-flex flex-column-reverse tablet:flex-row gap-2">
                <Button type="button" outline onClick={() => setStep(1)} className="width-full tablet:width-auto">{t.back}</Button>
                <Button type="submit" disabled={!isStep2Valid} className="width-full tablet:width-auto">{t.next}</Button>
              </div>
            </Form>
          )}

          {step === 3 && (
            <Form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <Fieldset legend={t.step3Title} legendStyle="large">
                <FormGroup>
                  <Label htmlFor="householdSize">{t.householdSizeLabel}</Label>
                  <Select
                    id="householdSize"
                    name="householdSize"
                    value={data.householdSize}
                    onChange={(e) => updateData('householdSize', e.target.value)}
                  >
                    <option value="">- Select -</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="incomeRange">{t.incomeLabel}</Label>
                  <Radio
                    id="income-under30"
                    name="incomeRange"
                    label={t.incomeUnder30}
                    value="Under $30,000"
                    checked={data.incomeRange === 'Under $30,000'}
                    onChange={(e) => updateData('incomeRange', e.target.value)}
                  />
                  <Radio
                    id="income-30to50"
                    name="incomeRange"
                    label={t.income30to50}
                    value="$30,000 - $50,000"
                    checked={data.incomeRange === '$30,000 - $50,000'}
                    onChange={(e) => updateData('incomeRange', e.target.value)}
                  />
                  <Radio
                    id="income-50to75"
                    name="incomeRange"
                    label={t.income50to75}
                    value="$50,000 - $75,000"
                    checked={data.incomeRange === '$50,000 - $75,000'}
                    onChange={(e) => updateData('incomeRange', e.target.value)}
                  />
                  <Radio
                    id="income-75to100"
                    name="incomeRange"
                    label={t.income75to100}
                    value="$75,000 - $100,000"
                    checked={data.incomeRange === '$75,000 - $100,000'}
                    onChange={(e) => updateData('incomeRange', e.target.value)}
                  />
                  <Radio
                    id="income-over100"
                    name="incomeRange"
                    label={t.incomeOver100}
                    value="Over $100,000"
                    checked={data.incomeRange === 'Over $100,000'}
                    onChange={(e) => updateData('incomeRange', e.target.value)}
                  />
                </FormGroup>
              </Fieldset>
              <div className="display-flex flex-column-reverse tablet:flex-row gap-2">
                <Button type="button" outline onClick={() => setStep(2)} className="width-full tablet:width-auto">{t.back}</Button>
                <Button type="submit" disabled={!isStep3Valid} className="width-full tablet:width-auto">{t.seeResults}</Button>
              </div>
            </Form>
          )}

          {step === 4 && (
            <div>
              <h2>{t.resultsTitle}</h2>
              <Alert
                type={calculateEligibility() === 'LIKELY_ELIGIBLE' ? 'success' : 'info'}
                headingLevel="h4"
              >
                {calculateEligibility() === 'LIKELY_ELIGIBLE' ? t.likelyEligible : t.needsReview}
              </Alert>

              <h3 className="margin-top-4">{t.nextStepsTitle}</h3>
              <p>{t.nextSteps}</p>

              <Button type="button" onClick={handleFindProviders} className="margin-top-2">
                {t.findProviders}
              </Button>
            </div>
          )}
        </Grid>
      </Grid>
    </GridContainer>
  );
}
