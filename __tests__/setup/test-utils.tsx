import { render, RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ReactElement } from 'react';

// Default messages mock
const defaultMessages = {
    Navbar: {
        races: 'Versenyek',
        results: 'Boutique',
        about: 'Rólunk',
        contact: 'Kapcsolat',
        transfer: 'Nevezés átruházás',
        login: 'Bejelentkezés',
        register: 'Regisztráció',
        welcome: 'Üdvözöljük',
    },
    // Add more namespaces as needed
};

/**
 * Custom render function with providers
 */
export function renderWithProviders(
    ui: ReactElement,
    {
        locale = 'hu',
        messages = defaultMessages,
        ...renderOptions
    }: RenderOptions & { locale?: string; messages?: any } = {}
) {
    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <NextIntlClientProvider locale={locale} messages={messages}>
                {children}
            </NextIntlClientProvider>
        );
    }

    return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';
export { renderWithProviders as render };
