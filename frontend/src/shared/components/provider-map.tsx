import { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Button } from '@trussworks/react-uswds';
import type { Provider } from '@/shared/domain/types';
import { ProviderType, AgeRange, CareType } from '@/shared/domain/enums';

const containerStyle = {
  width: '100%',
  height: '500px',
};

// Center on Oakland, CA
const defaultCenter = {
  lat: 37.8044,
  lng: -122.2712,
};

const ageLabels: Record<AgeRange, { en: string; es: string }> = {
  [AgeRange.INFANT]: { en: 'Infant', es: 'Bebe' },
  [AgeRange.TODDLER]: { en: 'Toddler', es: 'Nino Pequeno' },
  [AgeRange.PRESCHOOL]: { en: 'Preschool', es: 'Preescolar' },
  [AgeRange.SCHOOL_AGE]: { en: 'School Age', es: 'Edad Escolar' },
};

const careLabels: Record<CareType, { en: string; es: string }> = {
  [CareType.FULL_DAY]: { en: 'Full Day', es: 'Dia Completo' },
  [CareType.PART_DAY]: { en: 'Part Day', es: 'Medio Dia' },
  [CareType.BEFORE_AFTER_SCHOOL]: { en: 'Before/After School', es: 'Antes/Despues Escuela' },
  [CareType.DROP_IN]: { en: 'Drop-In', es: 'Ocasional' },
};

const translations = {
  en: {
    typeFamily: 'Family Child Care',
    typeCenter: 'Center-Based',
    phone: 'Phone',
    ages: 'Ages Served',
    careTypes: 'Care Types',
    acceptsSubsidy: 'Accepts Subsidy',
    expressInterest: 'Express Interest',
    mapLoadError: 'Error loading map',
    mapLoading: 'Loading map...',
  },
  es: {
    typeFamily: 'Cuidado Familiar',
    typeCenter: 'Centro',
    phone: 'Telefono',
    ages: 'Edades Atendidas',
    careTypes: 'Tipos de Cuidado',
    acceptsSubsidy: 'Acepta Subsidio',
    expressInterest: 'Expresar Interes',
    mapLoadError: 'Error al cargar el mapa',
    mapLoading: 'Cargando mapa...',
  },
};

type ProviderMapProps = {
  providers: Provider[];
  language: 'en' | 'es';
  onExpressInterest: (provider: Provider) => void;
};

export function ProviderMap({ providers, language, onExpressInterest }: ProviderMapProps) {
  const t = translations[language];
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const onMarkerClick = useCallback((provider: Provider) => {
    setSelectedProvider(provider);
  }, []);

  const onInfoWindowClose = useCallback(() => {
    setSelectedProvider(null);
  }, []);

  if (loadError) {
    return (
      <div className="bg-base-lightest padding-4 text-center">
        <p className="text-error">{t.mapLoadError}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-base-lightest padding-4 text-center" style={{ height: '500px' }}>
        <p>{t.mapLoading}</p>
      </div>
    );
  }

  // Calculate center based on providers with coordinates
  const providersWithCoords = providers.filter(p => p.latitude && p.longitude);
  const center = providersWithCoords.length > 0
    ? {
        lat: providersWithCoords.reduce((sum, p) => sum + (p.latitude || 0), 0) / providersWithCoords.length,
        lng: providersWithCoords.reduce((sum, p) => sum + (p.longitude || 0), 0) / providersWithCoords.length,
      }
    : defaultCenter;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
    >
      {providers.map((provider) => {
        if (!provider.latitude || !provider.longitude) return null;

        return (
          <Marker
            key={provider.id}
            position={{ lat: provider.latitude, lng: provider.longitude }}
            onClick={() => onMarkerClick(provider)}
            title={provider.name}
          />
        );
      })}

      {selectedProvider && selectedProvider.latitude && selectedProvider.longitude && (
        <InfoWindow
          position={{ lat: selectedProvider.latitude, lng: selectedProvider.longitude }}
          onCloseClick={onInfoWindowClose}
        >
          <div style={{ maxWidth: '300px', padding: '8px' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{selectedProvider.name}</h3>
            <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
              {selectedProvider.type === ProviderType.FAMILY_CHILD_CARE ? t.typeFamily : t.typeCenter}
            </p>

            <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
              {selectedProvider.address}<br />
              {selectedProvider.city}, CA {selectedProvider.zipCode}
            </p>

            {selectedProvider.phone && (
              <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                {t.phone}: {selectedProvider.phone}
              </p>
            )}

            {(language === 'es' ? selectedProvider.descriptionEs : selectedProvider.descriptionEn) && (
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#555' }}>
                {language === 'es' ? selectedProvider.descriptionEs : selectedProvider.descriptionEn}
              </p>
            )}

            <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}>
              <strong>{t.ages}:</strong>{' '}
              {selectedProvider.ageRangesServed.map(a => ageLabels[a][language]).join(', ')}
            </p>

            <p style={{ margin: '0 0 8px 0', fontSize: '13px' }}>
              <strong>{t.careTypes}:</strong>{' '}
              {selectedProvider.careTypesOffered.map(c => careLabels[c][language]).join(', ')}
            </p>

            {selectedProvider.acceptsSubsidy && (
              <p style={{ margin: '0 0 8px 0', color: '#2e7d32', fontWeight: 'bold', fontSize: '13px' }}>
                {t.acceptsSubsidy}
              </p>
            )}

            <Button
              type="button"
              onClick={() => {
                onExpressInterest(selectedProvider);
                onInfoWindowClose();
              }}
              style={{ marginTop: '8px' }}
            >
              {t.expressInterest}
            </Button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
