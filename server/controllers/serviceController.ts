import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getCollection } from '../db/mongo';
import { services, stats } from '../data/services';
import { logIntegrityRecord } from '../services/integrityService';

const JWT_SECRET = process.env.JWT_SECRET || 'gov-secure-secret-key-123';

interface ActivityRecord {
  _id?: ObjectId;
  userId: string;
  type: string;
  status: string;
  timestamp: string;
  location: string;
}

interface ServiceRequestRecord {
  _id?: ObjectId;
  requestId: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  tokenId: string;
  timestamp: string;
  requestHash: string;
  blockchainTxId: string;
  verificationMode: string;
  blockchainVerified: boolean;
  status: string;
}

const activityCollection = () => getCollection<ActivityRecord>(process.env.ACTIVITY_COLLECTION || 'activity_logs');
const serviceRequestsCollection = () => getCollection<ServiceRequestRecord>(process.env.SERVICE_REQUESTS_COLLECTION || 'service_requests');

const getAuthUser = (req: Request) => (req as any).user as { userId?: string; sub?: string } | undefined;

const addActivity = async (userId: string, type: string, status: string, location?: string) => {
  if (!location) {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data && data.city && data.country_name) {
        location = `${data.city}, ${data.country_name}`;
      } else {
        location = 'Unknown Location';
      }
    } catch {
      location = 'Chennai, India';
    }
  }

  await (await activityCollection()).insertOne({
    userId,
    type,
    status,
    timestamp: new Date().toISOString(),
    location,
  });
};

export const getServices = (req: Request, res: Response) => {
  res.json({ success: true, services });
};

export const getActivity = async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (!authUser?.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const activity = await (await activityCollection())
    .find({ userId: authUser.userId })
    .sort({ timestamp: -1 })
    .limit(20)
    .toArray();

  return res.json({ success: true, activity });
};

export const requestService = async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (!authUser?.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { serviceId } = req.body as { serviceId?: string };
  if (!serviceId) {
    return res.status(400).json({ success: false, message: 'serviceId is required.' });
  }

  const service = services.find((item) => item.id === serviceId);
  if (!service) {
    return res.status(404).json({ success: false, message: 'Service not found.' });
  }

  const timestamp = new Date().toISOString();
  const tokenId = `SRV-${Date.now().toString().slice(-6)}`;
  const integrity = await logIntegrityRecord({
    userId: authUser.userId,
    serviceId: service.id,
    timestamp,
  });

  await (await serviceRequestsCollection()).insertOne({
    requestId: `REQ-${Date.now()}`,
    userId: authUser.userId,
    serviceId: service.id,
    serviceName: service.name,
    tokenId,
    timestamp,
    requestHash: integrity.hash,
    blockchainTxId: integrity.blockchainTxId,
    verificationMode: integrity.verificationMode,
    blockchainVerified: integrity.blockchainVerified,
    status: 'issued',
  });

  await addActivity(authUser.userId, 'Service Request', 'Success');

  const serviceToken = jwt.sign(
    {
      userId: authUser.userId,
      serviceId: service.id,
      tokenId,
      hash: integrity.hash,
      blockchainTxId: integrity.blockchainTxId,
      verificationMode: integrity.verificationMode,
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  return res.json({
    success: true,
    message: `${service.name} token issued successfully.`,
    serviceToken,
    tokenMeta: {
      tokenId,
      accessLevel: 'Verified Citizen',
      validity: '15 minutes',
      blockchainTxId: integrity.blockchainTxId,
      requestHash: integrity.hash,
      verificationMode: integrity.verificationMode,
      blockchainVerified: integrity.blockchainVerified,
    },
  });
};

export const getStats = (_req: Request, res: Response) => {
  res.json({ success: true, stats });
};

export const getHealth = (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    mongodb: process.env.MONGO_URI ? 'configured' : 'not-configured',
    blockchain: process.env.BLOCKCHAIN_MODE === 'fabric-bridge' ? 'fabric-bridge' : 'demo-integrity-mode',
  });
};
