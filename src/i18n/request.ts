import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

import huMessages from '../../messages/hu.json';
import enMessages from '../../messages/en.json';
import deMessages from '../../messages/de.json';

const messagesMap: Record<string, any> = {
    hu: huMessages,
    en: enMessages,
    de: deMessages,
};

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
    }

    const messages = messagesMap[locale] || messagesMap[routing.defaultLocale];

    return {
        locale,
        messages
    };
});
