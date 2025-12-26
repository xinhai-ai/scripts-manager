import { NextRequest } from 'next/server';
import { generateLoaderScript } from '@/lib/script-loader';

export async function GET(request: NextRequest) {
  return generateLoaderScript(request);
}

