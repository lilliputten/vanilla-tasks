declare global {
  // const renderSignInButton: () => void;
  // const google: typeof import('google-one-tap');
  interface Window {
    google: typeof import('google-one-tap');
    // google: typeof import('google.accounts');
    renderSignInButton: () => void;
    onSignInSuccess: (p: unknown) => void;
    onSignInFailure: (p: unknown) => void;
  }
}
export default global;
