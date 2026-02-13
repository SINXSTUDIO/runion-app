import { faker } from '@faker-js/faker';
import { EventStatus, RegistrationStatus, PaymentMethod } from '@prisma/client';

/**
 * Test data factories using Faker
 */

export const createMockUser = (overrides: any = {}) => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    emailVerified: null,
    image: null,
    password: faker.internet.password(),
    tokenVersion: 0,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

export const createMockEvent = (overrides: any = {}) => ({
    id: faker.string.uuid(),
    title: faker.lorem.words(3),
    slug: faker.lorem.slug(),
    description: faker.lorem.paragraph(),
    status: EventStatus.PUBLISHED,
    eventDate: faker.date.future(),
    regDeadline: faker.date.soon(),
    location: faker.location.city(),
    coverImage: faker.image.url(),
    organizerId: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

export const createMockDistance = (overrides: any = {}) => ({
    id: faker.string.uuid(),
    eventId: faker.string.uuid(),
    name: `${faker.number.int({ min: 5, max: 42 })} km`,
    price: faker.number.int({ min: 5000, max: 20000 }),
    priceEur: faker.number.int({ min: 15, max: 60 }),
    capacityLimit: faker.number.int({ min: 50, max: 500 }),
    startTime: faker.date.future(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

export const createMockRegistration = (overrides: any = {}) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    distanceId: faker.string.uuid(),
    registrationStatus: RegistrationStatus.PENDING,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    formData: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
    },
    extras: [],
    crewSize: null,
    finalPrice: faker.number.int({ min: 5000, max: 20000 }),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

export const createMockProduct = (overrides: any = {}) => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    slug: faker.lorem.slug(),
    description: faker.commerce.productDescription(),
    price: faker.number.int({ min: 1000, max: 50000 }),
    active: true,
    stock: faker.number.int({ min: 0, max: 100 }),
    images: [faker.image.url()],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

/**
 * Create multiple mock items
 */
export const createMockUsers = (count: number, overrides: any = {}) =>
    Array.from({ length: count }, () => createMockUser(overrides));

export const createMockEvents = (count: number, overrides: any = {}) =>
    Array.from({ length: count }, () => createMockEvent(overrides));

export const createMockDistances = (count: number, overrides: any = {}) =>
    Array.from({ length: count }, () => createMockDistance(overrides));

export const createMockRegistrations = (count: number, overrides: any = {}) =>
    Array.from({ length: count }, () => createMockRegistration(overrides));
