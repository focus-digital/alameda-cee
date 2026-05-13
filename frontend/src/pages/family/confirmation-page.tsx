import { useLocation, Link } from 'react-router-dom';
import { Alert, Button, Card, CardBody, CardHeader, GridContainer, Grid } from '@trussworks/react-uswds';

const translations = {
  en: {
    title: 'Thank You!',
    subtitle: 'Your interest has been submitted successfully.',
    emailSent: 'A confirmation email has been sent to',
    textSent: 'A confirmation text has been sent to',
    phoneSent: 'We will give you a call at',
    nextStepsTitle: 'What Happens Next?',
    nextSteps: [
      'A staff member will review your submission within 2-3 business days.',
      'We will contact you using your preferred contact method to discuss next steps.',
      'If you have questions in the meantime, please call our office at (510) 555-0123.',
    ],
    disclaimer:
      'This is a demonstration system. In a production environment, your information would be securely stored and processed by First 5 Alameda County staff.',
    searchAgain: 'Search More Providers',
    backHome: 'Back to Home',
  },
  es: {
    title: 'Gracias!',
    subtitle: 'Su interes ha sido enviado exitosamente.',
    emailSent: 'Se ha enviado un correo de confirmacion a',
    textSent: 'Se ha enviado un mensaje de confirmacion a',
    phoneSent: 'Le llamaremos al',
    nextStepsTitle: 'Que Sigue?',
    nextSteps: [
      'Un miembro del personal revisara su solicitud dentro de 2-3 dias habiles.',
      'Nos comunicaremos con usted usando su metodo de contacto preferido para discutir los proximos pasos.',
      'Si tiene preguntas mientras tanto, por favor llame a nuestra oficina al (510) 555-0123.',
    ],
    disclaimer:
      'Este es un sistema de demostracion. En un entorno de produccion, su informacion seria almacenada y procesada de forma segura por el personal de First 5 del Condado de Alameda.',
    searchAgain: 'Buscar Mas Proveedores',
    backHome: 'Volver al Inicio',
  },
};

export function ConfirmationPage() {
  const location = useLocation();
  const state = location.state as {
    email?: string;
    phone?: string;
    contactMethod?: 'EMAIL' | 'PHONE' | 'TEXT';
    language?: 'en' | 'es';
  } | null;
  const language = state?.language ?? 'en';
  const email = state?.email;
  const phone = state?.phone;
  const contactMethod = state?.contactMethod;
  const t = translations[language];

  return (
    <GridContainer>
      <Grid row gap>
        <Grid col={12} tablet={{ col: 8 }} desktop={{ col: 6 }} className="margin-x-auto">
          <Card className="margin-top-6">
            <CardHeader>
              <h1 className="usa-card__heading">{t.title}</h1>
            </CardHeader>
            <CardBody>
              <Alert type="success" headingLevel="h2" slim className="margin-bottom-3">
                {t.subtitle}
              </Alert>

              {contactMethod === 'EMAIL' && email && (
                <p className="margin-bottom-3">
                  {t.emailSent} <strong>{email}</strong>
                </p>
              )}
              {contactMethod === 'TEXT' && phone && (
                <p className="margin-bottom-3">
                  {t.textSent} <strong>{phone}</strong>
                </p>
              )}
              {contactMethod === 'PHONE' && phone && (
                <p className="margin-bottom-3">
                  {t.phoneSent} <strong>{phone}</strong>
                </p>
              )}

              <h2 className="font-heading-md margin-bottom-2">{t.nextStepsTitle}</h2>
              <ol className="usa-list margin-bottom-3">
                {t.nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>

              <Alert type="info" headingLevel="h3" slim className="margin-bottom-3">
                {t.disclaimer}
              </Alert>

              <div className="display-flex flex-column">
                <Link to="/providers" className="width-full">
                  <Button type="button" className="width-full">{t.searchAgain}</Button>
                </Link>
                <Link to="/eligibility" className="width-full margin-top-2">
                  <Button type="button" outline className="width-full">
                    {t.backHome}
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </Grid>
      </Grid>
    </GridContainer>
  );
}
