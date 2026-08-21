import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from '../../src/pages/Login';

function mockFetch(response: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
  });
}

describe('Login page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders email and password inputs', () => {
    render(<Login />);
    expect(screen.getByLabelText('email')).toBeInTheDocument();
    expect(screen.getByLabelText('password')).toBeInTheDocument();
  });

  it('rejects invalid email format on submit', async () => {
    render(<Login />);
    fireEvent.change(screen.getByLabelText('email'), { target: { value: 'not-email' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'whatever' } });
    fireEvent.click(screen.getByTestId('login-submit'));
    // Browsers can short-circuit on the `type=email` HTML validation, so the
    // app's own error path runs when the validator gets through.
    const err = await screen.findByTestId('login-error');
    expect(err).toHaveTextContent(/valid email/);
  });

  it('shows server error on failed login', async () => {
    globalThis.fetch = mockFetch({ error: 'invalid credentials' }, false, 401);
    render(<Login />);
    fireEvent.change(screen.getByLabelText('email'), { target: { value: 'a@b.co' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'hunter22' } });
    fireEvent.click(screen.getByTestId('login-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toHaveTextContent(/invalid credentials/);
    });
  });

  it('calls onSuccess on a successful login', async () => {
    globalThis.fetch = mockFetch({
      user: { id: 1, email: 'a@b.co', name: 'A', role: 'member' },
      token: 'abc',
    });
    const onSuccess = vi.fn();
    render(<Login onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText('email'), { target: { value: 'a@b.co' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'hunter22' } });
    fireEvent.click(screen.getByTestId('login-submit'));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  // Was flaky: request resolves after a random 0-30ms delay; the old test
  // slept a fixed 15ms then asserted. Fix: wait for the condition with waitFor.
  it('signs in once the request resolves', async () => {
    globalThis.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                status: 200,
                json: async () => ({
                  user: { id: 1, email: 'a@b.co', name: 'A', role: 'member' },
                  token: 'abc',
                }),
              }),
            Math.random() * 30,
          ),
        ),
    );
    const onSuccess = vi.fn();
    render(<Login onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText('email'), { target: { value: 'a@b.co' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'hunter22' } });
    fireEvent.click(screen.getByTestId('login-submit'));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });
});
