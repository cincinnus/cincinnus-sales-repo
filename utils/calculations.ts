
import { AdSpend, SalesData, CalculatedMetrics, AppSettings } from '../types';

export const calculateMetrics = (spend: AdSpend, sales: SalesData): CalculatedMetrics => {
  const totalSpend = spend.awareness + spend.reels + spend.sales + spend.leads;
  
  // Summing all 6 channels
  const channels: (keyof SalesData)[] = ['website', 'amazon', 'flipkart', 'blinkit', 'myntra', 'offline'];
  
  const totalOrders = channels.reduce((sum, key) => sum + (sales[key]?.orders || 0), 0);
  const totalUnits = channels.reduce((sum, key) => sum + (sales[key]?.units || 0), 0);
  const totalRevenue = channels.reduce((sum, key) => sum + (sales[key]?.revenue || 0), 0);

  const cpo = totalOrders > 0 ? totalSpend / totalOrders : 0;
  const cpu = totalUnits > 0 ? totalSpend / totalUnits : 0;
  const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  
  const conversionEfficiency = totalUnits > 0 ? (totalOrders / totalUnits) * 100 : 0;

  return {
    totalSpend,
    totalOrders,
    totalUnits,
    totalRevenue,
    cpo,
    cpu,
    roas,
    conversionEfficiency
  };
};

export const determineStatus = (metrics: CalculatedMetrics, settings: AppSettings): 'Poor' | 'Average' | 'Excellent' => {
  const { roas, cpo } = metrics;
  const { targetRoas, targetCpo } = settings;

  if (roas >= targetRoas && (cpo <= targetCpo || targetCpo === 0)) return 'Excellent';
  if (roas >= targetRoas * 0.7) return 'Average';
  return 'Poor';
};
