import React, { useEffect, useState } from 'react';
import { Input } from '../common/Input/Input';
import { Button } from '../common/Button/Button';
import type { PlatformConfig } from '../../types/config.types';
import { CreditCard, Save } from 'lucide-react';

export interface SubscriptionSettingsCardProps {
  config?: PlatformConfig;
  onSubmit: (price: number) => void;
  isLoading?: boolean;
}

export const SubscriptionSettingsCard: React.FC<SubscriptionSettingsCardProps> = ({
  config,
  onSubmit,
  isLoading = false,
}) => {
  const [price, setPrice] = useState<number>(5999);

  useEffect(() => {
    if (config?.annual_subscription_price !== undefined) {
      setPrice(config.annual_subscription_price);
    }
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(price);
  };

  return (
    <div className="p-6 bg-white border border-[#E7DFD5] rounded-2xl shadow-sm flex flex-col gap-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#E7DFD5]">
        <div className="w-10 h-10 rounded-xl bg-[#211A19] text-[#A88B58] flex items-center justify-center shrink-0">
          <CreditCard size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#211A19] font-serif">Subscription Plans</h3>
          <p className="text-xs text-[#78716C]">Configure the annual subscription fee for merchants.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Annual Subscription Fee (?)"
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          min={0}
          required
        />

        <div className="flex justify-end pt-2 border-t border-[#E7DFD5]">
          <Button type="submit" variant="primary" leftIcon={<Save size={16} />} isLoading={isLoading}>
            Save Subscription Plan
          </Button>
        </div>
      </form>
    </div>
  );
};

