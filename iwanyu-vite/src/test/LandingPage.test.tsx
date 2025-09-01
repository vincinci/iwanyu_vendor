import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LandingPage } from '../pages/auth/LandingPage';

// Mock the auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('LandingPage', () => {
  it('renders the landing page correctly', () => {
    renderWithRouter(<LandingPage />);
    
    expect(screen.getByText('Welcome to')).toBeInTheDocument();
    expect(screen.getAllByText('Iwanyu').length).toBeGreaterThan(0);
    expect(screen.getByText('Start Selling Today')).toBeInTheDocument();
    expect(screen.getByText('Access Dashboard')).toBeInTheDocument();
  });

  it('displays feature cards', () => {
    renderWithRouter(<LandingPage />);
    
    expect(screen.getByText('Product Management')).toBeInTheDocument();
    expect(screen.getByText('Vendor Management')).toBeInTheDocument();
    expect(screen.getByText('Analytics & Reports')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Security')).toBeInTheDocument();
  });

  it('has navigation links', () => {
    renderWithRouter(<LandingPage />);
    
    const signInLinks = screen.getAllByText('Sign In');
    const getStartedLinks = screen.getAllByText(/Get Started|Start Selling Today/);
    
    expect(signInLinks.length).toBeGreaterThan(0);
    expect(getStartedLinks.length).toBeGreaterThan(0);
  });

  it('displays footer with proper links', () => {
    renderWithRouter(<LandingPage />);
    
    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
    expect(screen.getByText('© 2024 Iwanyu. All rights reserved.')).toBeInTheDocument();
  });
});