import { useState, type FormEvent } from "react";
import { contact } from "../../data/portfolioData";

/* Your Web3Forms access key. Create one free at https://web3forms.com
   and set VITE_WEB3FORMS_KEY in a .env file (see .env.example). */
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY ?? "";

type Status = "idle" | "submitting" | "success" | "error";

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");

  const validate = (): boolean => {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = "Please enter your name.";
    if (!EMAIL_RE.test(values.email.trim()))
      next.email = "Please enter a valid email address.";
    if (values.message.trim().length < 10)
      next.message = "Please add a few more details (10+ characters).";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!ACCESS_KEY) {
      setStatus("error");
      setServerMessage(
        "The contact form isn't configured yet. Please email me directly and I'll get right back to you."
      );
      return;
    }

    setStatus("submitting");
    setServerMessage("");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: `Portfolio message from ${values.name}`,
          from_name: values.name,
          name: values.name,
          email: values.email,
          message: values.message,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setValues({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
        setServerMessage(
          data.message ?? "Something went wrong. Please try again."
        );
      }
    } catch {
      setStatus("error");
      setServerMessage(
        "Network error — please try again or email me directly."
      );
    }
  };

  if (status === "success") {
    return (
      <div className="cform cform--success" role="status">
        <div className="cform__success-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3>Message sent</h3>
        <p>
          Thanks for reaching out — I&rsquo;ll reply at the earliest. You can
          also reach me directly at{" "}
          <a href={`mailto:${contact.email}`}>{contact.email}</a>.
        </p>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => setStatus("idle")}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className="cform" onSubmit={handleSubmit} noValidate>
      <div className="cform__field">
        <label htmlFor="cf-name">Your name</label>
        <input
          id="cf-name"
          name="name"
          type="text"
          value={values.name}
          onChange={handleChange}
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "cf-name-err" : undefined}
          placeholder="Jane Doe"
        />
        {errors.name && (
          <span id="cf-name-err" className="cform__error">
            {errors.name}
          </span>
        )}
      </div>

      <div className="cform__field">
        <label htmlFor="cf-email">Your email</label>
        <input
          id="cf-email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "cf-email-err" : undefined}
          placeholder="jane@company.com"
        />
        {errors.email && (
          <span id="cf-email-err" className="cform__error">
            {errors.email}
          </span>
        )}
      </div>

      <div className="cform__field">
        <label htmlFor="cf-message">Message</label>
        <textarea
          id="cf-message"
          name="message"
          rows={5}
          value={values.message}
          onChange={handleChange}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "cf-message-err" : undefined}
          placeholder="Tell me about the role, project, or opportunity…"
        />
        {errors.message && (
          <span id="cf-message-err" className="cform__error">
            {errors.message}
          </span>
        )}
      </div>

      {status === "error" && serverMessage && (
        <p className="cform__server-error" role="alert">
          {serverMessage}
        </p>
      )}

      <button
        type="submit"
        className="btn btn--primary cform__submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
        {status !== "submitting" && (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
            <path d="M22 2 11 13" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 2 15 22l-4-9-9-4 20-7Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </form>
  );
}
