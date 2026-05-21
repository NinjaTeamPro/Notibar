/**
 * UUID v4 wrapper — centralises uuid package import.
 * Client-side IDs are generated here; server-side uses wp_generate_uuid4().
 */
import { v4 as uuidv4 } from 'uuid';

export { uuidv4 };
