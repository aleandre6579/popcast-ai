import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import Support from './Support';

vi.mock('gsap', () => ({
  default: {
    timeline: vi.fn(() => {
      const timelineMock = {
        fromTo: vi.fn(() => timelineMock),
        to: vi.fn(() => timelineMock),
        kill: vi.fn(),
      };
      return timelineMock;
    }),
    fromTo: vi.fn(),
    to: vi.fn(),
  },
}));

describe('Support Component', () => {
  it('should render the header correctly', () => {
    render(<Support />);

    // Check if the title and description are rendered 
    expect(
      screen.getByText('Thank you for using PopcastAI!'),
    ).toBeInTheDocument();
  });
});
