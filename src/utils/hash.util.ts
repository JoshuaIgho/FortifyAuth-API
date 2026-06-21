import argon2 from 'argon2';

/**
 * Hash a password using Argon2id
 * @param password Plaintext password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
};

/**
 * Verify a password against a hash
 * @param hash Hashed password
 * @param password Plaintext password
 * @returns Boolean indicating if the password matches the hash
 */
export const verifyPassword = async (hash: string, password: string): Promise<boolean> => {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    return false;
  }
};
