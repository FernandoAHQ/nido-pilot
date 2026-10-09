import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { STORAGE_KEY } from './lib/progress';

describe('Nido', () => {
  it('lleva al mapa y mantiene bloqueados los mundos futuros', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /empezar aventura/i }));

    expect(screen.getByRole('heading', { name: /mundos de patrones/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /jardín saltarín/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /bahía burbuja/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /bosque de luz/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /festival de nido/i })).toBeEnabled();
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

  it('presenta los nuevos retos como capítulos de una historia', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      unlockedWorld: 5,
      completedChallenges: [],
      lastWorld: 5,
    }));
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /empezar aventura/i }));
    await user.click(screen.getByRole('button', { name: /bosque de luz/i }));
    expect(screen.getByRole('heading', { name: /bosque de luz/i })).toBeInTheDocument();
    expect(screen.getByText(/todos los cuentos están abiertos/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /capítulo 1: una luz en el sendero/i }));

    expect(screen.getByText('Capítulo 1 de 6')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /una luz en el sendero/i })).toBeInTheDocument();
    expect(screen.getByText(/lila perdió el camino/i)).toBeInTheDocument();
    expect(screen.getByAltText(/lumi y lila frente a un sendero/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(screen.getByRole('heading', { name: /el puente de bellotas/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /anterior/i }));
    expect(screen.getByRole('heading', { name: /una luz en el sendero/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /resolver el patrón/i }));
    expect(screen.getByRole('heading', { name: /qué pieza sigue/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /volver al cuento/i })).toBeInTheDocument();
    expect(screen.getByAltText(/lumi y lila frente a un sendero/i)).toBeInTheDocument();
  });
});
