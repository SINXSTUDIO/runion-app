
export type FormFieldType = 'text' | 'email' | 'tel' | 'zip' | 'number' | 'select' | 'checkbox' | 'radio' | 'date' | 'textarea' | 'gender';

export interface FormField {
    id: string; // Unique ID (e.g., 'field_1234')
    type: FormFieldType;
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[]; // Comma separated or array for Select/Radio
    description?: string; // Helper text
}

export interface FormConfig {
    fields: FormField[];
}
