/**
 * Browser shim for aws4.
 *
 * AWS Signature V4 needs Node's `crypto`, `url`, and `querystring` modules.
 * Browser clients must not use a Para secret key. They authenticate with a
 * JWT through signIn(). If a secret key is used in the browser, fail loudly
 * instead of shipping a bundle that needs Node builtins.
 */
export function sign() {
  throw new Error(
    'AWS SigV4 signing is not available in the browser. Use signIn() and a blank secret key.'
  );
}

export default { sign };
