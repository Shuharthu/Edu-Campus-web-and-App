enum AppFlavor { dev, staging, production }

class FlavorConfig {
  final AppFlavor flavor;
  final String apiBaseUrl;
  final String wsUrl;
  final String oidcRedirectUri;

  const FlavorConfig({
    required this.flavor,
    required this.apiBaseUrl,
    required this.wsUrl,
    required this.oidcRedirectUri,
  });

  static const dev = FlavorConfig(
    flavor: AppFlavor.dev,
    apiBaseUrl: 'https://edu-campus-web-and-app-two.vercel.app/api/v1',
    wsUrl: 'ws://192.168.50.87:4000/ws',
    oidcRedirectUri: 'smartedu.dev://auth/callback',
  );

  static const staging = FlavorConfig(
    flavor: AppFlavor.staging,
    apiBaseUrl: 'https://staging-api.{{institution_domain}}/api/v1',
    wsUrl: 'wss://staging-api.{{institution_domain}}/ws',
    oidcRedirectUri: 'smartedu.staging://auth/callback',
  );

  static const production = FlavorConfig(
    flavor: AppFlavor.production,
    apiBaseUrl: 'https://edu-campus-web-and-app-two.vercel.app/api/v1',
    wsUrl: 'ws://192.168.50.87:4000/ws',
    oidcRedirectUri: 'smartedu://auth/callback',
  );
}
