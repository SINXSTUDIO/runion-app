export { BaseRepository } from './base/base-repository';
export { EventRepository } from './event-repository';
export { UserRepository } from './user-repository';
export { RegistrationRepository } from './registration-repository';
export { ProductRepository } from './product-repository';

// Instantiate singletons for easy import
import { EventRepository } from './event-repository';
import { UserRepository } from './user-repository';
import { RegistrationRepository } from './registration-repository';
import { ProductRepository } from './product-repository';

export const eventRepository = new EventRepository();
export const userRepository = new UserRepository();
export const registrationRepository = new RegistrationRepository();
export const productRepository = new ProductRepository();
