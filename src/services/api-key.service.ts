import crypto from 'crypto';
import { AuditAction } from '@prisma/client';
import { ApiKeyRepository } from '../repositories/api-key.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { NotFoundError, ForbiddenError } from '../utils/api-error';

export class ApiKeyService {
  public static async createKey(
    userId: string,
    name: string,
    scopes: string[],
    ip: string,
    userAgent: string,
  ) {
    const rawBytes = crypto.randomBytes(24).toString('hex');
    const rawKey = `fa_live_${rawBytes}`;
    const prefix = `${rawKey.substring(0, 12)}...`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await ApiKeyRepository.create({
      name,
      prefix,
      keyHash,
      scopes,
      user: { connect: { id: userId } },
    });

    await AuditRepository.create({
      action: AuditAction.API_KEY_CREATED,
      user: { connect: { id: userId } },
      ipAddress: ip,
      userAgent: userAgent,
      payload: { keyId: apiKey.id, name: apiKey.name, scopes: apiKey.scopes },
    });

    return {
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        prefix: apiKey.prefix,
        scopes: apiKey.scopes,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
      },
      secretReveal: rawKey,
    };
  }

  public static async getUserKeys(userId: string) {
    const keys = await ApiKeyRepository.findByUserId(userId);
    return keys.map((k) => ({
      id: k.id,
      name: k.name,
      prefix: k.prefix,
      scopes: k.scopes,
      isActive: k.isActive,
      createdAt: k.createdAt,
    }));
  }

  public static async deleteKey(keyId: string, userId: string, ip: string, userAgent: string) {
    const key = await ApiKeyRepository.findById(keyId);
    if (!key) {
      throw new NotFoundError('API Key not found');
    }

    if (key.userId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this API Key');
    }

    await ApiKeyRepository.deleteById(keyId);

    await AuditRepository.create({
      action: AuditAction.API_KEY_REVOKED,
      user: { connect: { id: userId } },
      ipAddress: ip,
      userAgent: userAgent,
      payload: { keyId, keyName: key.name },
    });
  }
}
