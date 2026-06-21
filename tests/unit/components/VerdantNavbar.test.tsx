// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { VerdantNavbar } from '@/components/layout/VerdantNavbar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    onClick,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

const mockUseSession = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: mockUseSession,
    signOut: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('VerdantNavbar', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({ data: null });
  });

  it("n'affiche pas le lien Mon Compte quand l'utilisateur est déconnecté", () => {
    render(<VerdantNavbar />);
    expect(screen.queryByRole('link', { name: /mon compte/i })).toBeNull();
  });

  it('affiche le lien Mon Compte dans le dropdown quand l\'utilisateur est connecté', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@example.com', name: 'Test User' } },
    });
    render(<VerdantNavbar />);

    const avatarButton = screen.getByRole('button', { name: /menu utilisateur/i });
    await userEvent.click(avatarButton);

    const link = screen.getByRole('link', { name: /mon compte/i });
    expect(link.getAttribute('href')).toBe('/account');
  });
});
