import { FormEvent } from 'react';

type LoginProps = { onSwitch: () => void };

const GoogleIcon = () => <span className="google-icon" aria-hidden="true">G</span>;

export default function Login({ onSwitch }: LoginProps) {
  const submit = (event: FormEvent) => {
    event.preventDefault();
  };

  return (
    <main className="auth-page">
      <section className="auth-visual login-visual">
        <nav className="brand"><span className="brand-mark">⌁</span> GlobeTrotter</nav>
        <div className="visual-copy">
          <p className="eyebrow">YOUR NEXT STORY STARTS HERE</p>
          <h1>Find your<br />wild.</h1>
          <p>Thoughtful journeys, memorable places, and a little more room to wander.</p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-content">
          <div className="mobile-brand"><span className="brand-mark">⌁</span> GlobeTrotter</div>
          <p className="eyebrow ink">WELCOME BACK</p>
          <h2>Good to see you.</h2>
          <p className="intro">Sign in to pick up where your next adventure left off.</p>
          <button className="google-button" type="button"><GoogleIcon />Continue with Google</button>
          <div className="divider"><span>or continue with email</span></div>
          <form onSubmit={submit}>
            <label>Email address<input type="email" placeholder="you@example.com" required /></label>
            <label>Password<span className="label-action">Forgot password?</span><input type="password" placeholder="Enter your password" required /></label>
            <button className="primary-button" type="submit">Log in <span>→</span></button>
          </form>
          <p className="switch-copy">New to GlobeTrotter? <button onClick={onSwitch} type="button">Create an account</button></p>
        </div>
      </section>
    </main>
  );
}
