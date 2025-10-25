import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN_HERE', // Substitua pela sua DSN do Sentry
  environment: __DEV__ ? 'development' : 'production',
  debug: __DEV__,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filtrar eventos de desenvolvimento se necessário
    if (__DEV__) {
      return null;
    }
    return event;
  },
});

export default Sentry;
