import { describe, it, expect } from 'vitest';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://wbulnnxdkagfylgjefka.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_p0BylQ46BRXHR4bebWZ95g_abAOG1Ix';
import { GET } from '@/app/api/detect-changes/route';

describe('detect-changes endpoint', () => {
  it('returns expected JSON structure', async () => {
    // Mock request (not used in handler)
    const mockRequest = {} as Request;
    process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const response = await GET(mockRequest);
    const json = await response.json();
    expect(json).toHaveProperty('currentPricingVersion');
    expect(json).toHaveProperty('totalAuditsChecked');
    expect(json).toHaveProperty('outdatedAuditsCount');
    expect(json).toHaveProperty('outdatedAudits');
    expect(Array.isArray(json.outdatedAudits)).toBe(true);
  });
});
