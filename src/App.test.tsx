import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { STORAGE_KEY } from './lib/progress';

describe('Nido', () => {
  it('usa la identidad visual oficial en la portada', () => {
    render(<App />);

    expect(screen.getByAltText(/nido\. pequeñas mentes/i)).toHaveAttribute('src', '/nido_logo_transparent.png');
    expect(screen.getByAltText(/lumi saluda con alegría/i)).toHaveAttribute('src', '/lumi_hero.webp');
    expect(screen.getByRole('heading', { name: /bienvenido a nido/i })).toBeInTheDocument();
  });

  it('muestra cinco historias abiertas en el mapa', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /empezar aventura/i }));

    expect(screen.getByRole('heading', { name: /historias de patrones/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bosque de luz/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /festival de nido/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /arrecife arcoíris/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /tren de las estaciones/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /ciudad de los inventos/i })).toBeEnabled();
  });

  it('acepta una respuesta dentro de una nueva historia', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /empezar aventura/i }));
    await user.click(screen.getByRole('button', { name: /arrecife arcoíris/i }));
    await user.click(screen.getByRole('button', { name: /capítulo 1: la perla perdida/i }));
    await user.click(screen.getByRole('button', { name: /resolver el patrón/i }));
    await user.click(screen.getByRole('button', { name: 'burbuja' }));

    expect(screen.getByText('¡Lo lograste!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siguiente patrón/i })).toBeInTheDocument();
  });

  it('muestra una pista después de dos respuestas incorrectas', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App />);
    await user.click(screen.getByRole('button', { name: /empezar aventura/i }));
    await user.click(screen.getByRole('button', { name: /arrecife arcoíris/i }));
    await user.click(screen.getByRole('button', { name: /capítulo 1: la perla perdida/i }));
    await user.click(screen.getByRole('button', { name: /resolver el patrón/i }));
    await user.click(screen.getByRole('button', { name: 'pez' }));
    await vi.advanceTimersByTimeAsync(700);
    await user.click(screen.getByRole('button', { name: 'pez' }));

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
    expect(screen.getByAltText(/nido\. pequeñas mentes/i)).toHaveAttribute('src', '/nido_logo_transparent.png');
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
    expect(screen.getByRole('heading', { name: /qué pieza falta/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /volver al cuento/i })).toBeInTheDocument();
    expect(screen.getByAltText(/lumi y lila frente a un sendero/i)).toBeInTheDocument();
  });

  it('muestra el siguiente patrón del capítulo después de un acierto', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /empezar aventura/i }));
    await user.click(screen.getByRole('button', { name: /bosque de luz/i }));
    await user.click(screen.getByRole('button', { name: /capítulo 1: una luz en el sendero/i }));
    await user.click(screen.getByRole('button', { name: /resolver el patrón/i }));

    expect(screen.getByText(/k1 · reto 1 de 3/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'hoja' }));
    await user.click(screen.getByRole('button', { name: /siguiente patrón/i }));

    expect(screen.getByText(/k1 · reto 2 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /qué pieza falta/i })).toBeInTheDocument();
  });

  it('adapta el capítulo al nivel escolar seleccionado', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /empezar aventura/i }));
    await user.click(screen.getByRole('button', { name: /1\.º 5 patrones/i }));
    await user.click(screen.getByRole('button', { name: /bosque de luz/i }));
    await user.click(screen.getByRole('button', { name: /capítulo 1: una luz en el sendero/i }));
    await user.click(screen.getByRole('button', { name: /resolver el patrón/i }));

    expect(screen.getByText(/1\.º · reto 1 de 5/i)).toBeInTheDocument();
    expect(screen.getByText('Patrón 1 de 5')).toBeInTheDocument();
  });
});
