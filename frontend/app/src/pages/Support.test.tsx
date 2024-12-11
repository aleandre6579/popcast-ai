import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest'
import Support from './Support'

vi.mock('gsap') // Mock GSAP to avoid running actual animations in tests

describe('Support Component', () => {
  it('should render the header correctly', () => {
    render(<Support />)

    // Check if the title and description are rendered
    expect(
      screen.getByText('Thank you for using PopcastAI!'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Your support allows me to work on my apps fulltime and build more products that I love.',
      ),
    ).toBeInTheDocument()
  })

  it('should show a message when there are no supporters', () => {
    render(<Support />)

    // Check if the message about no supporters is displayed
    expect(screen.getByText('Be my first supporter!')).toBeInTheDocument()
  })
})
