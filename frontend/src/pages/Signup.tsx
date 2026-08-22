import { FormEvent } from 'react';
import { signup } from "../services/authApi";

type SignupProps = { onSwitch: () => void };

export default function Signup({ onSwitch }: SignupProps) {
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await signup({
        firstName: String(form.get("firstName") ?? ""),
        lastName: String(form.get("lastName") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      });
      window.location.hash = "#dashboard";
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to create your account.");
    }
  };

  return (
    <main className="auth-page signup-page">
      <section className="auth-visual signup-visual">
        <nav className="brand"><span className="brand-mark">⌁</span> GlobeTrotter</nav>
        <div className="visual-copy">
          <p className="eyebrow">THE WORLD IS WAITING</p>
          <h1>Go where<br />you feel alive.</h1>
          <p>Save the places that move you and turn daydreams into journeys.</p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-content signup-content">
          <div className="mobile-brand"><span className="brand-mark">⌁</span> GlobeTrotter</div>
          <p className="eyebrow ink">JOIN THE JOURNEY</p>
          <h2>Make space for wonder.</h2>
          <p className="intro">Create your account and keep every beautiful possibility close.</p>
          <button className="google-button" type="button"><span className="google-icon">G</span>Sign up with Google</button>
          <div className="divider"><span>or sign up with email</span></div>
          <form onSubmit={submit}>
            <div className="name-row"><label>First name<input name="firstName" type="text" placeholder="Avery" required /></label><label>Last name<input name="lastName" type="text" placeholder="Stone" /></label></div>
            <label>Email address<input name="email" type="email" placeholder="you@example.com" required /></label>
            <label>Password<input name="password" type="password" placeholder="At least 8 characters" minLength={8} required /></label>
            <label className="terms"><input type="checkbox" required /><span>I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.</span></label>
            <button className="primary-button" type="submit">Create account <span>→</span></button>
          </form>
          <p className="switch-copy">Already have an account? <button onClick={onSwitch} type="button">Log in</button></p>
        </div>
      </section>
    </main>
  );
}
