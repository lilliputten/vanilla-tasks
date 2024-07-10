declare global {
  interface Window {
    google: typeof import('google-one-tap');
    onSignInSuccess: (p: unknown) => void;
    onSignInFailure: (p: unknown) => void;
  }
}
export default global;
