import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

describe('Nido', () => {
  it('lleva al mapa y mantiene bloqueados los mundos futuros', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /empezar aventura/i }));

    expect(screen.getByRole('heading', { name: /mundos de patrones/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /jardín saltarín/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /bahía burbuja/i })).toBeDisabled();
  });

  it('acepta la respuesta correcta y muestra la continuación', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /empezar aventura/i }));
    await user.click(screen.getByRole('button', { name: /jardín saltarín/i }));
    await user.click(screen.getByRole('button', { name: 'rojo' }));

    expect(screen.getByText('¡Lo lograste!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siguiente reto/i })).toBeInTheDocument();
  });

  it('muestra una pista después de dos respuestas incorrectas', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App />);
    await user.click(screen.getByRole('button', { name: /empezar aventura/i }));
    await user.click(screen.getByRole('button', { name: /jardín saltarín/i }));
    await user.click(screen.getByRole('button', { name: 'amarillo' }));
    await vi.advanceTimersByTimeAsync(700);
    await user.click(screen.getByRole('button', { name: 'amarillo' }));

    expect(screen.getByText(/mira el grupo iluminado/i)).toBeInTheDocument();
    vi.useRealTimers();
  });
});
