declare global {
  const renderSignInButton: () => void;
  interface Window {
    renderSignInButton: () => void;
    onSignInSuccess: (p: unknown) => void;
    onSignInFailure: (p: unknown) => void;
  }
}
export default global;
