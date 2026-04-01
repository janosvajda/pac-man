// Simulated API handler for POST /example
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name } = req.body;
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Name is required.' });
  }
  if (name.length > 24) {
    return res.status(400).json({ message: 'Name too long.' });
  }

  // Simulate intermittent server error for testing failure state (should be rare!)
  if (name === 'error') {
    return res.status(500).json({ message: 'Deliberate server error.' });
  }
  // Success
  return res.status(200).json({ message: 'OK' });
}
