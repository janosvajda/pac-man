import React, { useState } from 'react';

interface FormFields {
  name: string;
}

interface FormState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export const ExampleComponent: React.FC = () => {
  const [fields, setFields] = useState<FormFields>({ name: '' });
  const [state, setState] = useState<FormState>({ loading: false, error: null, success: false });
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const validate = (fields: FormFields): string | null => {
    if (!fields.name.trim()) {
      return 'Name is required.';
    }
    if (fields.name.length > 24) {
      return 'Name must be 24 characters or less.';
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
    setState({ ...state, error: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    const error = validate(fields);
    if (error) {
      setState({ ...state, error });
      return;
    }
    setState({ loading: true, error: null, success: false });
    try {
      const response = await fetch('/example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!response.ok) {
        // 400 or 500 error simulation.
        let msg = 'Unknown error occurred.';
        if (response.status === 400) msg = 'Invalid data.';
        if (response.status === 500) msg = 'Server error. Please try again.';
        setState({ loading: false, error: msg, success: false });
        return;
      }
      setState({ loading: false, error: null, success: true });
    } catch (err) {
      setState({ loading: false, error: 'Network error. Check connection.', success: false });
    }
  };

  // UI States: idle, loading, error, success
  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 360, margin: '0 auto', padding: 24, border: '1px solid #ececec', borderRadius: 8 }} aria-busy={state.loading}>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="example-name">Name <span style={{color:'red'}}>*</span></label>
        <input
          id="example-name"
          name="name"
          maxLength={24}
          required
          value={fields.name}
          onChange={handleChange}
          style={{ display: 'block', width: '100%', padding: 8, boxSizing: 'border-box', marginTop: 4 }}
          aria-invalid={state.error ? 'true' : undefined}
          aria-describedby={state.error ? 'example-form-error' : undefined}
        />
      </div>

      {state.error && (
        <div id="example-form-error" role="alert" style={{ color: '#c00', marginBottom: 12 }}>{state.error}</div>
      )}

      {state.success && (
        <div role="status" style={{ color: 'green', marginBottom: 12 }}>
          Success! Your submission has been processed.
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" disabled={state.loading || !!state.success} style={{ flexGrow: 1 }}>
          {state.loading ? 'Submitting...' : 'Submit'}
        </button>
        <button
          type="button"
          style={{ flexGrow: 1 }}
          onClick={() => {
            setFields({ name: '' });
            setState({ loading: false, error: null, success: false });
            setHasSubmitted(false);
          }}
          disabled={state.loading}
        >
          Reset
        </button>
      </div>
    </form>
  );
};
