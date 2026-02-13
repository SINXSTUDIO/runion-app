export const slugify = (text: string): string => {
    if (!text) return '';

    return text.toString().toLowerCase()
        .replace(/[áa]/g, 'a')
        .replace(/[ée]/g, 'e')
        .replace(/[íi]/g, 'i')
        .replace(/[óöőo]/g, 'o')
        .replace(/[úüűu]/g, 'u')
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w-]+/g, '')       // Remove all non-word chars
        .replace(/--+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
};
