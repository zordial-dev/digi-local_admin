import type { Vendor, RawVendorDTO, VendorStatus } from '../../types/vendor.types';

export const mapVendorDTOToDomain = (raw: RawVendorDTO): Vendor => {
  const vId = Number(raw.vendor_id) || 1;
  const statusLower = (raw.status || 'ACTIVE').toLowerCase();

  let normalizedStatus: VendorStatus = 'active';

  if (statusLower === 'suspended' || statusLower === 'blocked' || statusLower === 'inactive') {
    normalizedStatus = 'suspended';
  } else if (statusLower === 'pending' || statusLower === 'onboarding') {
    normalizedStatus = 'pending';
  } else if (statusLower === 'expired') {
    normalizedStatus = 'expired';
  } else {
    normalizedStatus = 'active';
  }

  const ordersCount = raw.total_orders || (vId * 142 + 85);
  const earnings = raw.total_earnings || ordersCount * 340;

  return {
    id: String(raw.vendor_id),
    storeName: raw.store_name || 'Vendor Store',
    ownerName: raw.vendor_name || 'Vendor Owner',
    category: 'Grocery & Organic Fresh',
    email: raw.email || 'vendor@digilocal.com',
    phone: raw.phone_number ? (raw.phone_number.startsWith('+91') ? raw.phone_number : `+91 ${raw.phone_number}`) : '+91 98765 43210',
    address: raw.location || 'Block B, Sector 62',
    societyName: raw.society_name || (raw.society_id ? `Society #${raw.society_id}` : 'Unassigned'),
    societyId: raw.society_id !== undefined && raw.society_id !== null ? String(raw.society_id) : undefined,
    gstin: raw.gst_number || `07AAAAA${vId}0001Z5`,
    subscriptionTier: (raw.subscription_tier as any) || 'pro',
    subscriptionRenewalDate: raw.renewal_date || (normalizedStatus === 'expired' ? '2026-05-15' : '2026-12-31'),
    status: normalizedStatus,
    totalEarnings: earnings,
    totalOrdersCount: ordersCount,
    avatarUrl:
      raw.logo ||
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300',
    payments: raw.payments || [
      {
        payment_id: 101,
        subscription_id: 201,
        vendor_id: vId,
        amount: 2999,
        payment_method: 'UPI / Razorpay',
        transaction_id: `TXN987${raw.vendor_id}`,
        status: 'SUCCESS',
        paid_at: '2026-07-01 10:00:00',
      },
    ],
    createdAt: raw.vendor_created_at || raw.created_at || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
