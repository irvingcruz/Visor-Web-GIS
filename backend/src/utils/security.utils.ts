import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
const crypto = require('crypto');

const SALT_ROUNDS = 10;

export const securityUtils = {

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  },

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  },

  async generateToken(payload: any) {

    const options: SignOptions = {
      expiresIn: process.env.JWT_EXPIRES_IN as unknown as number
    };

    return jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      options
    );
  },

  hash256(textoEntrada: string): string {
    return crypto.createHash('sha256').update(textoEntrada).digest('hex');
  },

}