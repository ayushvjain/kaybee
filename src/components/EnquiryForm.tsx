import { useState, type ChangeEvent, type ComponentProps } from 'react';

/**
 * React 19 deprecates the bare `FormEvent` alias, so derive the submit event
 * type from the form element's own prop signature instead.
 */
type FormSubmitEvent = Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0];

type Props = {
  /** Web3Forms access key. Empty means the form is not configured yet. */
  accessKey: string;
  products: string[];
  phone: string;
  whatsappHref: string;
  email: string;
};

type Status = 'idle' | 'sending' | 'sent' | 'error';

type Fields = {
  name: string;
  company: string;
  phone: string;
  email: string;
  product: string;
  shaftSize: string;
  quantity: string;
  message: string;
};

const EMPTY: Fields = {
  name: '',
  company: '',
  phone: '',
  email: '',
  product: '',
  shaftSize: '',
  quantity: '',
  message: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Indian numbers are 10 digits, optionally with +91 / 0 / STD prefixes. */
function validPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

export default function EnquiryForm({
  accessKey,
  products,
  phone,
  whatsappHref,
  email,
}: Props) {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [status, setStatus] = useState<Status>('idle');

  const set = (key: keyof Fields) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  function validate(): boolean {
    const next: Partial<Record<keyof Fields, string>> = {};

    if (!fields.name.trim()) next.name = 'Please tell us your name.';
    if (!fields.phone.trim()) {
      next.phone = 'A phone number lets us respond fastest.';
    } else if (!validPhone(fields.phone)) {
      next.phone = 'Please enter a valid phone number.';
    }
    if (fields.email.trim() && !EMAIL_RE.test(fields.email.trim())) {
      next.email = 'Please check this email address.';
    }
    if (!fields.message.trim()) next.message = 'Please describe what you need.';

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormSubmitEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStatus('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Website enquiry from ${fields.name.trim()}`,
          from_name: 'Kaybee International website',
          name: fields.name.trim(),
          company: fields.company.trim(),
          phone: fields.phone.trim(),
          email: fields.email.trim(),
          product: fields.product,
          shaft_size: fields.shaftSize.trim(),
          quantity: fields.quantity.trim(),
          message: fields.message.trim(),
        }),
      });

      if (!res.ok) throw new Error(`Web3Forms responded ${res.status}`);
      const data = (await res.json()) as { success?: boolean };
      if (!data.success) throw new Error('Web3Forms rejected the submission');

      setStatus('sent');
      setFields(EMPTY);
    } catch {
      setStatus('error');
    }
  }

  /* ---- not configured: never show a form that silently drops enquiries ---- */
  if (!accessKey) {
    return (
      <div className="ef ef--notice">
        <h3>Enquiry form not yet connected</h3>
        <p>
          The form needs a Web3Forms access key before it can deliver messages. Rather than accept
          enquiries and lose them, it is disabled. Please reach us directly in the meantime:
        </p>
        <Fallbacks phone={phone} whatsappHref={whatsappHref} email={email} />
      </div>
    );
  }

  if (status === 'sent') {
    return (
      <div className="ef ef--success" role="status">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="m7.5 12.5 3 3 6-6.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3>Thank you — your enquiry has been sent.</h3>
        <p>
          We will get back to you shortly. If it is urgent, calling is always quicker than waiting
          on email.
        </p>
        <Fallbacks phone={phone} whatsappHref={whatsappHref} email={email} />
        <button type="button" className="kb-btn kb-btn--ghost" onClick={() => setStatus('idle')}>
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form className="ef" onSubmit={onSubmit} noValidate>
      {/* Honeypot: bots fill this, humans never see it. */}
      <input
        type="checkbox"
        name="botcheck"
        className="ef__honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="ef__row">
        <Field
          label="Your name"
          name="name"
          required
          value={fields.name}
          onChange={set('name')}
          error={errors.name}
          autoComplete="name"
        />
        <Field
          label="Company"
          name="company"
          value={fields.company}
          onChange={set('company')}
          autoComplete="organization"
        />
      </div>

      <div className="ef__row">
        <Field
          label="Phone"
          name="phone"
          type="tel"
          required
          value={fields.phone}
          onChange={set('phone')}
          error={errors.phone}
          autoComplete="tel"
        />
        <Field
          label="Email"
          name="email"
          type="email"
          value={fields.email}
          onChange={set('email')}
          error={errors.email}
          autoComplete="email"
        />
      </div>

      <div className="ef__row">
        <div className="ef__field">
          <label className="ef__label" htmlFor="ef-product">
            Product
          </label>
          <select
            id="ef-product"
            name="product"
            className="ef__input"
            value={fields.product}
            onChange={set('product')}
          >
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            <option value="Other / not sure">Other / not sure</option>
          </select>
        </div>
        <Field
          label="Shaft size"
          name="shaftSize"
          value={fields.shaftSize}
          onChange={set('shaftSize')}
          placeholder='e.g. 2.1/2"'
        />
      </div>

      <div className="ef__row">
        <Field
          label="Quantity"
          name="quantity"
          value={fields.quantity}
          onChange={set('quantity')}
          placeholder="e.g. 10 nos."
        />
        <div className="ef__field ef__field--spacer" aria-hidden="true" />
      </div>

      <div className="ef__field">
        <label className="ef__label" htmlFor="ef-message">
          What do you need? <span className="ef__req">*</span>
        </label>
        <textarea
          id="ef-message"
          name="message"
          rows={5}
          className="ef__input"
          value={fields.message}
          onChange={set('message')}
          placeholder="Series, designation, application, or a description of the part you are replacing."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'ef-message-err' : undefined}
        />
        {errors.message && (
          <p className="ef__error" id="ef-message-err">
            {errors.message}
          </p>
        )}
      </div>

      {status === 'error' && (
        <div className="ef__alert" role="alert">
          <p>
            <strong>That did not go through.</strong> Something failed on the way to our inbox.
            Please use one of these instead so your enquiry is not lost:
          </p>
          <Fallbacks phone={phone} whatsappHref={whatsappHref} email={email} />
        </div>
      )}

      <div className="ef__actions">
        <button
          type="submit"
          className="kb-btn kb-btn--primary"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? 'Sending…' : 'Send enquiry'}
        </button>
        <p className="ef__note">
          We reply to enquiries during business hours. Fields marked{' '}
          <span className="ef__req">*</span> are required.
        </p>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */

function Fallbacks({
  phone,
  whatsappHref,
  email,
}: {
  phone: string;
  whatsappHref: string;
  email: string;
}) {
  return (
    <ul className="ef__fallbacks">
      {phone && (
        <li>
          <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>
        </li>
      )}
      {whatsappHref && (
        <li>
          <a href={whatsappHref} target="_blank" rel="noopener">
            WhatsApp
          </a>
        </li>
      )}
      {email && (
        <li>
          <a href={`mailto:${email}`}>{email}</a>
        </li>
      )}
    </ul>
  );
}

type FieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
};

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required,
  error,
  placeholder,
  autoComplete,
}: FieldProps) {
  const id = `ef-${name}`;
  return (
    <div className="ef__field">
      <label className="ef__label" htmlFor={id}>
        {label} {required && <span className="ef__req">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className="ef__input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
      />
      {error && (
        <p className="ef__error" id={`${id}-err`}>
          {error}
        </p>
      )}
    </div>
  );
}
