# Bug Fix: Spanish Diacritics / Missing Accent Marks

## User Story
As a Spanish-speaking family using the CEE interest form, I want the Spanish text in confirmation messages and the form itself to use correct Spanish grammar and punctuation so that the communications look professional and are easy to read.

## Context
Spanish requires accent marks (tildes/diacritics) on many words. The current Spanish text throughout the interest form page (frontend) and the SMS/email confirmation messages (backend) is missing these accents. This affects every Spanish-speaking user who submits the interest form. This is a pure text-content fix — no logic, no schema, no dependencies change.

## Integration Flow
```
User submits form with PreferredLanguage.SPANISH
  → Frontend displays Spanish UI labels (interest-form-page.tsx translations)
  → Backend sends Spanish SMS (interestService.ts sendConfirmationSms)
  → Backend sends Spanish email (interestService.ts sendConfirmationEmail)
```

## Critical Files

| File | Change |
|---|---|
| `frontend/src/pages/family/interest-form-page.tsx` | Fix Spanish translation strings (lines 52–83, 93–98, 108–113) |
| `backend/src/service/interestService.ts` | Fix Spanish SMS and email text (lines 150–151, 173–190) |

## Implementation Steps

### 1. Fix Frontend Spanish Translations
**File:** `frontend/src/pages/family/interest-form-page.tsx`

Update the `es` translations object (lines 52–83):

```tsx
es: {
  title: 'Expresar Interés',                                    // was: Expresar Interes
  backToSearch: 'Volver a Búsqueda de Proveedores',             // was: Busqueda
  providerLabel: 'Proveedor',
  contactMethodLabel: 'Método de Contacto Preferido',           // was: Metodo
  contactMethodPhone: 'Teléfono',                               // was: Telefono
  contactMethodEmail: 'Correo Electrónico',                     // was: Electronico
  contactMethodText: 'Mensaje de Texto',
  phoneLabel: 'Número de Teléfono',                             // was: Numero de Telefono
  emailLabel: 'Correo Electrónico',                             // was: Electronico
  languageLabel: 'Idioma Preferido',
  languageEnglish: 'Inglés',                                    // was: Ingles
  languageSpanish: 'Español',                                   // was: Espanol
  notesLabel: 'Notas Adicionales',
  notesPlaceholder: 'Cualquier información adicional que desee compartir...',  // was: informacion
  submit: 'Enviar',
  submitting: 'Enviando...',
  error: 'Hubo un error al enviar su interés. Por favor intente de nuevo.',    // was: interes
  phoneRequired: 'El número de teléfono es requerido para contacto por teléfono o texto.',  // was: numero, telefono (×2)
  emailRequired: 'El correo electrónico es requerido para contacto por correo.',            // was: electronico
  screenerInfo: 'Información del Cuestionario de Elegibilidad',  // was: Informacion
  zipCode: 'Código Postal',                                      // was: Codigo
  childAge: 'Rango de Edad del Niño',                            // was: Nino
  careType: 'Tipo de Cuidado',
  householdSize: 'Tamaño del Hogar',                             // was: Tamano
  incomeRange: 'Rango de Ingresos',
  startDate: 'Fecha de Inicio Deseada',
  typeFamily: 'Cuidado Familiar',
  typeCenter: 'Centro',
  loadingProvider: 'Cargando proveedor...',
  providerNotFound: 'Proveedor no encontrado.',
},
```

Also fix `ageLabels.es` (lines 93–98):
```tsx
es: {
  [AgeRange.INFANT]: 'Bebé (0-12 meses)',                      // was: Bebe
  [AgeRange.TODDLER]: 'Niño Pequeño (1-3 años)',               // was: Nino Pequeno, anos
  [AgeRange.PRESCHOOL]: 'Preescolar (3-5 años)',               // was: anos
  [AgeRange.SCHOOL_AGE]: 'Edad Escolar (5+ años)',             // was: anos
},
```

Also fix `careLabels.es` (lines 108–113):
```tsx
es: {
  [CareType.FULL_DAY]: 'Día Completo',                         // was: Dia
  [CareType.PART_DAY]: 'Medio Día',                            // was: Dia
  [CareType.BEFORE_AFTER_SCHOOL]: 'Antes/Después de la Escuela',  // was: Despues
  [CareType.DROP_IN]: 'Ocasional',
},
```

### 2. Fix Backend SMS Messages
**File:** `backend/src/service/interestService.ts` (lines 148–154)

```ts
const body = isSpanish
  ? isText
    ? "Gracias por su interés en el programa CEE. Hemos recibido su solicitud y nos pondremos en contacto con usted pronto por mensaje de texto."
    : "Gracias por su interés en el programa CEE. Hemos recibido su solicitud y le llamaremos pronto."
  : isText
    ? "Thank you for your interest in the CEE program. We received your request and will follow up with you by text soon."
    : "Thank you for your interest in the CEE program. We received your request and will give you a call soon.";
```
*(Change: `"su interes"` → `"su interés"` in both Spanish variants)*

### 3. Fix Backend Email Content
**File:** `backend/src/service/interestService.ts` (lines 173–190)

```ts
const subject = isSpanish
  ? "Confirmación de su interés en cuidado infantil"   // was: Confirmacion, interes
  : "Confirmation of Your Child Care Interest";

const html = isSpanish
  ? `
    <h1>Gracias por expresar su interés</h1>
    <p>Hemos recibido su solicitud de interés en <strong>${providerName}</strong>.</p>
    <h2>Próximos pasos</h2>
    <ul>
      <li>Un administrador de subsidios revisará su solicitud</li>
      <li>Se comunicarán con usted para discutir sus opciones y los próximos pasos</li>
      <li>Este formulario de interés <strong>no garantiza elegibilidad, aprobación o inscripción</strong></li>
    </ul>
    <p>Si tiene preguntas, por favor espere a que un administrador se comunique con usted.</p>
    <p><em>Este es un mensaje automatizado del sistema de Elegibilidad y Matrícula Coordinada de First 5 Alameda County.</em></p>
  `
```
*(Changes: `interes` → `interés`, `Proximos` → `Próximos`, `revisara` → `revisará`, `comunicaran` → `comunicarán`, `proximos` → `próximos`, `Matricula` → `Matrícula`, `aprobacion` → `aprobación`, `inscripcion` → `inscripción`)*

## Verification
1. Run backend tests: `cd backend && npm test`
2. Run frontend type check: `cd frontend && npm run typecheck` (or `tsc --noEmit`)
3. Start the frontend dev server and navigate to the interest form, switch language to Spanish — verify all labels and option text show proper accents
4. If Twilio/email is configured in `.env`, submit the form in Spanish and verify the SMS/email content has correct accents
