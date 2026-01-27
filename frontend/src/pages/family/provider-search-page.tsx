import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  FormGroup,
  Grid,
  GridContainer,
  Label,
  Select,
  TextInput,
} from '@trussworks/react-uswds';
import { useProviders } from '@/shared/hooks/provider-queries';
import { AgeRange, CareType, ProviderType } from '@/shared/domain/enums';
import type { Provider } from '@/shared/domain/types';
import { ProviderMap } from '@/shared/components/provider-map';

const translations = {
  en: {
    title: 'Find Child Care Providers',
    subtitle: 'Search for child care providers in your area.',
    filterTitle: 'Filter Providers',
    filtersApplied: 'filters applied',
    showFilters: 'Show Filters',
    hideFilters: 'Hide Filters',
    zipLabel: 'ZIP Code',
    typeLabel: 'Provider Type',
    typeAll: 'All Types',
    typeFamily: 'Family Child Care',
    typeCenter: 'Center-Based',
    ageLabel: 'Ages Served',
    careLabel: 'Care Types',
    search: 'Search',
    clearFilters: 'Clear Filters',
    results: 'providers found',
    noResults: 'No providers found matching your criteria.',
    loading: 'Loading providers...',
    error: 'Error loading providers. Please try again.',
    phone: 'Phone',
    email: 'Email',
    ages: 'Ages Served',
    careTypes: 'Care Types',
    acceptsSubsidy: 'Accepts Subsidy',
    expressInterest: 'Express Interest',
    ageInfant: 'Infant',
    ageToddler: 'Toddler',
    agePreschool: 'Preschool',
    ageSchoolAge: 'School Age',
    careFullDay: 'Full Day',
    carePartDay: 'Part Day',
    careBeforeAfter: 'Before/After School',
    careDropIn: 'Drop-In',
    mapView: 'Map View',
    listView: 'List View',
  },
  es: {
    title: 'Buscar Proveedores de Cuidado Infantil',
    subtitle: 'Busque proveedores de cuidado infantil en su area.',
    filterTitle: 'Filtrar Proveedores',
    filtersApplied: 'filtros aplicados',
    showFilters: 'Mostrar Filtros',
    hideFilters: 'Ocultar Filtros',
    zipLabel: 'Codigo Postal',
    typeLabel: 'Tipo de Proveedor',
    typeAll: 'Todos los Tipos',
    typeFamily: 'Cuidado Familiar',
    typeCenter: 'Centro',
    ageLabel: 'Edades Atendidas',
    careLabel: 'Tipos de Cuidado',
    search: 'Buscar',
    clearFilters: 'Limpiar Filtros',
    results: 'proveedores encontrados',
    noResults: 'No se encontraron proveedores que coincidan con sus criterios.',
    loading: 'Cargando proveedores...',
    error: 'Error al cargar proveedores. Por favor intente de nuevo.',
    phone: 'Telefono',
    email: 'Correo',
    ages: 'Edades Atendidas',
    careTypes: 'Tipos de Cuidado',
    acceptsSubsidy: 'Acepta Subsidio',
    expressInterest: 'Expresar Interes',
    ageInfant: 'Bebe',
    ageToddler: 'Nino Pequeno',
    agePreschool: 'Preescolar',
    ageSchoolAge: 'Edad Escolar',
    careFullDay: 'Dia Completo',
    carePartDay: 'Medio Dia',
    careBeforeAfter: 'Antes/Despues Escuela',
    careDropIn: 'Ocasional',
    mapView: 'Vista de Mapa',
    listView: 'Vista de Lista',
  },
};

const ageLabels = {
  en: { [AgeRange.INFANT]: 'Infant', [AgeRange.TODDLER]: 'Toddler', [AgeRange.PRESCHOOL]: 'Preschool', [AgeRange.SCHOOL_AGE]: 'School Age' },
  es: { [AgeRange.INFANT]: 'Bebe', [AgeRange.TODDLER]: 'Nino Pequeno', [AgeRange.PRESCHOOL]: 'Preescolar', [AgeRange.SCHOOL_AGE]: 'Edad Escolar' },
};

const careLabels = {
  en: { [CareType.FULL_DAY]: 'Full Day', [CareType.PART_DAY]: 'Part Day', [CareType.BEFORE_AFTER_SCHOOL]: 'Before/After School', [CareType.DROP_IN]: 'Drop-In' },
  es: { [CareType.FULL_DAY]: 'Dia Completo', [CareType.PART_DAY]: 'Medio Dia', [CareType.BEFORE_AFTER_SCHOOL]: 'Antes/Despues Escuela', [CareType.DROP_IN]: 'Ocasional' },
};

export function ProviderSearchPage() {
  const navigate = useNavigate();
  const context = useOutletContext<{ language: 'en' | 'es' } | undefined>();
  const language = context?.language ?? 'en';
  const t = translations[language];

  const [zipInput, setZipInput] = useState('');
  const [filters, setFilters] = useState({
    zipCode: '',
    type: '' as ProviderType | '',
    ageRanges: [] as AgeRange[],
    careTypes: [] as CareType[],
  });

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Count active filters
  const activeFilterCount = [
    filters.zipCode ? 1 : 0,
    filters.type ? 1 : 0,
    filters.ageRanges.length,
    filters.careTypes.length,
  ].reduce((a, b) => a + b, 0);

  const handleExpressInterest = (provider: Provider) => {
    navigate(`/interest/${provider.id}`);
  };

  // Pre-populate filters from screener data
  useEffect(() => {
    const stored = sessionStorage.getItem('cee_screener_data');
    if (stored) {
      try {
        const screenerData = JSON.parse(stored);
        const zip = screenerData.zipCode || '';
        setZipInput(zip);
        setFilters({
          zipCode: zip,
          type: '' as ProviderType | '',
          ageRanges: screenerData.childAgeRange ? [screenerData.childAgeRange as AgeRange] : [],
          careTypes: screenerData.careTypePreference ? [screenerData.careTypePreference as CareType] : [],
        });
      } catch {
        // Ignore invalid data
      }
    }
  }, []);

  // Only update zipCode filter when 5 digits or empty
  const handleZipChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    setZipInput(cleaned);
    if (cleaned.length === 5 || cleaned.length === 0) {
      setFilters((p) => ({ ...p, zipCode: cleaned }));
    }
  };

  // Build the filter object for the query - filters apply immediately
  const queryFilters = {
    zipCode: filters.zipCode || undefined,
    type: filters.type || undefined,
    ageRanges: filters.ageRanges.length > 0 ? filters.ageRanges : undefined,
    careTypes: filters.careTypes.length > 0 ? filters.careTypes : undefined,
  };

  const { data: providers, isLoading, error } = useProviders(queryFilters);

  const handleClearFilters = () => {
    setZipInput('');
    setFilters({ zipCode: '', type: '' as ProviderType | '', ageRanges: [], careTypes: [] });
  };

  const toggleAgeRange = (age: AgeRange) => {
    setFilters((prev) => ({
      ...prev,
      ageRanges: prev.ageRanges.includes(age)
        ? prev.ageRanges.filter((a) => a !== age)
        : [...prev.ageRanges, age],
    }));
  };

  const toggleCareType = (care: CareType) => {
    setFilters((prev) => ({
      ...prev,
      careTypes: prev.careTypes.includes(care)
        ? prev.careTypes.filter((c) => c !== care)
        : [...prev.careTypes, care],
    }));
  };

  return (
    <GridContainer>
      <Grid row gap>
        <Grid col={12}>
          <h1 className="margin-top-4">{t.title}</h1>
          <p className="usa-intro">{t.subtitle}</p>
        </Grid>
      </Grid>

      <Grid row gap>
        {/* Filters sidebar */}
        <Grid col={12} tablet={{ col: 4 }} desktop={{ col: 3 }}>
          <Card>
            {/* Mobile: collapsible header */}
            <CardHeader className="tablet:display-none">
              <div className="display-flex flex-justify flex-align-center width-full">
                <Button
                  type="button"
                  unstyled
                  className="font-body-md text-bold"
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                >
                  {filtersExpanded ? t.hideFilters : t.showFilters}
                  {activeFilterCount > 0 && !filtersExpanded && (
                    <span className="text-base font-body-2xs margin-left-1">
                      ({activeFilterCount} {t.filtersApplied})
                    </span>
                  )}
                </Button>
                {activeFilterCount > 0 && (
                  <Button type="button" unstyled className="font-body-2xs" onClick={handleClearFilters}>
                    {t.clearFilters}
                  </Button>
                )}
              </div>
            </CardHeader>
            {/* Desktop: always visible header */}
            <CardHeader className="display-none tablet:display-block">
              <h3 className="usa-card__heading">{t.filterTitle}</h3>
              <Button type="button" unstyled className="font-body-2xs" onClick={handleClearFilters}>
                {t.clearFilters}
              </Button>
            </CardHeader>
            {/* Filter content - hidden on mobile when collapsed */}
            <CardBody className={filtersExpanded ? '' : 'display-none tablet:display-block'}>
              <FormGroup>
                <Label htmlFor="zipCode">{t.zipLabel}</Label>
                <TextInput
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  maxLength={5}
                  value={zipInput}
                  onChange={(e) => handleZipChange(e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="providerType">{t.typeLabel}</Label>
                <Select
                  id="providerType"
                  name="providerType"
                  value={filters.type}
                  onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value as ProviderType | '' }))}
                >
                  <option value="">{t.typeAll}</option>
                  <option value={ProviderType.FAMILY_CHILD_CARE}>{t.typeFamily}</option>
                  <option value={ProviderType.CENTER_BASED}>{t.typeCenter}</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="ageRanges">{t.ageLabel}</Label>
                {Object.values(AgeRange).map((age) => (
                  <Checkbox
                    key={age}
                    id={`age-${age}`}
                    name="ageRanges"
                    label={ageLabels[language][age]}
                    checked={filters.ageRanges.includes(age)}
                    onChange={() => toggleAgeRange(age)}
                  />
                ))}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="careTypes">{t.careLabel}</Label>
                {Object.values(CareType).map((care) => (
                  <Checkbox
                    key={care}
                    id={`care-${care}`}
                    name="careTypes"
                    label={careLabels[language][care]}
                    checked={filters.careTypes.includes(care)}
                    onChange={() => toggleCareType(care)}
                  />
                ))}
              </FormGroup>
            </CardBody>
          </Card>
        </Grid>

        {/* Results */}
        <Grid col={12} tablet={{ col: 8 }} desktop={{ col: 9 }}>
          {isLoading && <p>{t.loading}</p>}
          {error && <Alert type="error" headingLevel="h4">{t.error}</Alert>}

          {providers && (
            <>
              <div className="display-flex flex-justify margin-bottom-2">
                <p className="margin-0">
                  <strong>{providers.length}</strong> {t.results}
                </p>
                <div className="usa-button-group usa-button-group--segmented">
                  <Button
                    type="button"
                    outline={viewMode !== 'map'}
                    onClick={() => setViewMode('map')}
                  >
                    {t.mapView}
                  </Button>
                  <Button
                    type="button"
                    outline={viewMode !== 'list'}
                    onClick={() => setViewMode('list')}
                  >
                    {t.listView}
                  </Button>
                </div>
              </div>

              {providers.length === 0 && <Alert type="info" headingLevel="h4">{t.noResults}</Alert>}

              {providers.length > 0 && viewMode === 'map' && (
                <div className="margin-bottom-3">
                  <ProviderMap
                    providers={providers}
                    language={language}
                    onExpressInterest={handleExpressInterest}
                  />
                </div>
              )}

              {providers.length > 0 && viewMode === 'list' && (
                <Grid row gap>
                  {providers.map((provider) => (
                    <Grid key={provider.id} col={12} desktop={{ col: 6 }}>
                      <Card className="margin-bottom-2">
                        <CardHeader>
                          <h3 className="usa-card__heading">{provider.name}</h3>
                          <p className="usa-card__subheading">
                            {provider.type === ProviderType.FAMILY_CHILD_CARE ? t.typeFamily : t.typeCenter}
                          </p>
                        </CardHeader>
                        <CardBody>
                          <p>
                            {provider.address}<br />
                            {provider.city}, CA {provider.zipCode}
                          </p>
                          {provider.phone && <p>{t.phone}: {provider.phone}</p>}
                          {(language === 'es' ? provider.descriptionEs : provider.descriptionEn) && (
                            <p className="font-body-2xs">
                              {language === 'es' ? provider.descriptionEs : provider.descriptionEn}
                            </p>
                          )}
                          <p className="margin-top-1">
                            <strong>{t.ages}:</strong>{' '}
                            {provider.ageRangesServed.map((a) => ageLabels[language][a]).join(', ')}
                          </p>
                          <p>
                            <strong>{t.careTypes}:</strong>{' '}
                            {provider.careTypesOffered.map((c) => careLabels[language][c]).join(', ')}
                          </p>
                          {provider.acceptsSubsidy && (
                            <p className="text-green">
                              <strong>{t.acceptsSubsidy}</strong>
                            </p>
                          )}
                        </CardBody>
                        <CardFooter>
                          <Button type="button" onClick={() => handleExpressInterest(provider)}>
                            {t.expressInterest}
                          </Button>
                        </CardFooter>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </GridContainer>
  );
}
