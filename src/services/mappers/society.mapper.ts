import type { Society, RawSocietyDTO } from '../../types/society.types';

export const mapSocietyDTOToDomain = (dto: RawSocietyDTO): Society => {
  const locationParts = dto.location ? dto.location.split(',').map((s) => s.trim()) : [];
  const city = locationParts[locationParts.length - 1] || 'Noida';
  const state = locationParts.length > 1 ? locationParts[locationParts.length - 2] : 'UP';
  const address = dto.location || 'Block A, Sector 62, Noida';

  const statusLower = (dto.status || 'ACTIVE').toLowerCase();
  const normalizedStatus: 'active' | 'suspended' | 'pending' =
    statusLower === 'suspended' || statusLower === 'blocked'
      ? 'suspended'
      : statusLower === 'pending'
      ? 'pending'
      : 'active';

  return {
    id: String(dto.society_id),
    name: dto.society_name,
    code: dto.public_id || `SOC-${dto.society_id}`,
    city,
    state,
    postalCode: '201301',
    address,
    totalVendorsCount: dto.vendor_count || 0,
    status: normalizedStatus,
    createdAt: dto.created_at || new Date().toISOString(),
    updatedAt: dto.created_at || new Date().toISOString(),
  };
};
