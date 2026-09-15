import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import { Donut, Bar, Line } from '../components/Charts';

function ThrowingComponent() {
  throw new Error('Test error');
}

function SafeComponent() {
  return <div>Safe content</div>;
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('shows error UI when child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('has retry button', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    spy.mockRestore();
  });
});

describe('Donut', () => {
  it('renders chart card container', () => {
    const { container } = render(<Donut value={42} label="Test" />);
    expect(container.querySelector('.chart-card')).toBeInTheDocument();
    expect(container.querySelector('.donut-wrap')).toBeInTheDocument();
  });

  it('renders SVG with donut elements', () => {
    const { container } = render(<Donut value={10} label="Users" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg.querySelectorAll('circle').length).toBeGreaterThan(0);
    expect(svg.querySelectorAll('text').length).toBeGreaterThan(0);
  });
});

describe('Bar', () => {
  it('renders chart card with bar rows', () => {
    const data = [{ label: 'iOS', value: 10 }, { label: 'Android', value: 20 }];
    const { container } = render(<Bar data={data} />);
    expect(container.querySelector('.chart-card')).toBeInTheDocument();
    expect(container.querySelectorAll('.bar-row').length).toBe(2);
  });

  it('renders empty state', () => {
    const { container } = render(<Bar data={[]} />);
    expect(container.querySelector('.bar-wrap')).toBeInTheDocument();
    expect(container.querySelectorAll('.bar-row').length).toBe(0);
  });
});

describe('Line', () => {
  it('renders chart card', () => {
    const data = [{ date: '2026-01-01', value: 5 }];
    const { container } = render(<Line data={data} />);
    expect(container.querySelector('.chart-card')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    const { container } = render(<Line data={[]} />);
    expect(container.querySelector('.chart-card')).toBeInTheDocument();
  });
});
