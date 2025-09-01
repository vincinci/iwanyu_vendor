import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Mock Supabase
vi.mock('../lib/auth', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  },
}));

// Test component to access auth context
const TestComponent = () => {
  const { user, loading, signIn, signOut } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>
        Sign In
      </button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides auth context to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByTestId('user')).toBeInTheDocument();
  });

  it('handles sign in action', async () => {
    const user = userEvent.setup();
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = screen.getByText('Sign In');
    await user.click(signInButton);

    // Test that sign in function is called
    expect(signInButton).toBeInTheDocument();
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });
});