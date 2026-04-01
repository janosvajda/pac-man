import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { ExampleComponent } from '../ExampleComponent';

jest.spyOn(global, 'fetch').mockImplementation((url, opts: any) => {
  // Simulate server logic from src/api/example.ts
  const { name } = JSON.parse(opts.body);
  if (!name || name.trim() === '') {
    return Promise.resolve({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Name is required.' }),
    } as Response);
  }
  if (name.length > 24) {
    return Promise.resolve({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Name too long.' }),
    } as Response);
  }
  if (name === 'error') {
    return Promise.resolve({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Deliberate server error.' }),
    } as Response);
  }
  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({ message: 'OK' }),
  } as Response);
});

afterAll(() => {
  (global.fetch as jest.Mock).mockRestore();
});

describe('ExampleComponent', () => {
  it('shows validation error for empty name', async () => {
    render(<ExampleComponent />);
    fireEvent.click(screen.getByText('Submit'));
    expect(await screen.findByText('Name is required.')).toBeInTheDocument();
  });

  it('shows error for long name', async () => {
    render(<ExampleComponent />);
    fireEvent.change(screen.getByLabelText('Name *'), { target: { value: 'a'.repeat(25) } });
    fireEvent.click(screen.getByText('Submit'));
    expect(await screen.findByText('Name must be 24 characters or less.')).toBeInTheDocument();
  });

  it('submits successfully with valid input', async () => {
    render(<ExampleComponent />);
    fireEvent.change(screen.getByLabelText('Name *'), { target: { value: 'PacMan' } });
    fireEvent.click(screen.getByText('Submit'));
    expect(await screen.findByText('Success! Your submission has been processed.')).toBeInTheDocument();
  });

  it('shows server error for reserved input', async () => {
    render(<ExampleComponent />);
    fireEvent.change(screen.getByLabelText('Name *'), { target: { value: 'error' } });
    fireEvent.click(screen.getByText('Submit'));
    expect(await screen.findByText('Server error. Please try again.')).toBeInTheDocument();
  });

  it('can be reset after submission', async () => {
    render(<ExampleComponent />);
    fireEvent.change(screen.getByLabelText('Name *'), { target: { value: 'PacMan' } });
    fireEvent.click(screen.getByText('Submit'));
    await screen.findByText('Success! Your submission has been processed.');
    fireEvent.click(screen.getByText('Reset'));
    expect((screen.getByLabelText('Name *') as HTMLInputElement).value).toBe('');
    expect(screen.queryByText('Success! Your submission has been processed.')).toBeNull();
  });
});
