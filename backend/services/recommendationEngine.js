/**
 * Personalized Energy-Saving Recommendation Engine
 * Analyzes the user's specific house architecture and appliances to suggest
 * concrete energy conservation measures with quantifiable kWh and cost savings.
 */

class RecommendationEngine {
  /**
   * Generates tailored energy-saving recommendations
   * 
   * @param {Object} houseDetails - House parameters
   * @param {Array<Object>} appliances - List of appliances
   * @param {Object} prediction - Output from PredictionEngine
   * @returns {Array<Object>} List of recommendations with estimated savings
   */
  static generate(houseDetails = {}, appliances = [], prediction = {}) {
    const recommendations = [];
    const averageTariff = 0.60;

    // 1. Check for AC usage
    const acs = appliances.filter(a => a.appliance_type.toLowerCase().includes('ac') || a.appliance_type.toLowerCase().includes('air conditioner'));
    if (acs.length > 0) {
      const totalAcHours = acs.reduce((sum, a) => sum + (parseFloat(a.daily_usage_hours) * parseInt(a.quantity || 1, 10)), 0);
      const estimatedAcKwh = acs.reduce((sum, a) => sum + ((parseFloat(a.power_rating_watts) * parseFloat(a.daily_usage_hours) * parseInt(a.quantity || 1, 10) * 30) / 1000), 0);
      
      // Recommendation: Thermostat optimization (24°C instead of 18°C saves ~20%)
      const acSavingsKwh = parseFloat((estimatedAcKwh * 0.20).toFixed(2));
      recommendations.push({
        title: 'Optimize AC Thermostat to 24°C (75°F)',
        description: `Each degree above 20°C reduces compressor workload by 6%. Running your ${acs.length} Air Conditioner(s) at 24°C will save roughly 20% of cooling energy without sacrificing room comfort.`,
        estimated_kwh_savings: acSavingsKwh,
        estimated_cost_savings: parseFloat((acSavingsKwh * averageTariff).toFixed(2)),
        priority: 'High'
      });
    }

    // 2. Check for Water Heater / Geysers
    const geysers = appliances.filter(a => a.appliance_type.toLowerCase().includes('geyser') || a.appliance_type.toLowerCase().includes('water heater'));
    if (geysers.length > 0) {
      const geyserKwh = geysers.reduce((sum, a) => sum + ((parseFloat(a.power_rating_watts) * parseFloat(a.daily_usage_hours) * parseInt(a.quantity || 1, 10) * 30) / 1000), 0);
      const geyserSavings = parseFloat((geyserKwh * 0.25).toFixed(2));
      recommendations.push({
        title: 'Install Geyser Timers & Limit Preheating to 25 Mins',
        description: 'Water geysers consume 2000W-3000W. Limiting preheating time and insulating hot water delivery pipes prevents continuous thermostat reheating cycles.',
        estimated_kwh_savings: geyserSavings,
        estimated_cost_savings: parseFloat((geyserSavings * averageTariff).toFixed(2)),
        priority: 'High'
      });
    }

    // 3. Check for Low Star-Rating Appliances (1 or 2 stars)
    const inefficientAppliances = appliances.filter(a => parseInt(a.star_rating || 3, 10) <= 2);
    if (inefficientAppliances.length > 0) {
      const inefficientNames = inefficientAppliances.map(a => a.appliance_type).join(', ');
      const totalInefficientKwh = inefficientAppliances.reduce((sum, a) => sum + ((parseFloat(a.power_rating_watts) * parseFloat(a.daily_usage_hours) * parseInt(a.quantity || 1, 10) * 30) / 1000), 0);
      const starUpgradeSavings = parseFloat((totalInefficientKwh * 0.28).toFixed(2));
      recommendations.push({
        title: `Upgrade Low Efficiency Appliances (1-2 Stars)`,
        description: `You have low efficiency units (${inefficientNames}). Upgrading to 5-Star BEE or Energy Star rated inverter appliances can reduce their baseline power draw by 25-30%.`,
        estimated_kwh_savings: starUpgradeSavings,
        estimated_cost_savings: parseFloat((starUpgradeSavings * averageTariff).toFixed(2)),
        priority: 'High'
      });
    }

    // 4. Check House Ventilation factor
    if (houseDetails.ventilation === 'Poor') {
      recommendations.push({
        title: 'Improve Cross-Ventilation & Window Shading',
        description: 'Your home currently has Poor ventilation, which traps warm air and causes cooling appliances to draw 15% more power. Installing reflective window films and allowing morning/evening cross-breeze will significantly lower cooling costs.',
        estimated_kwh_savings: 28.00,
        estimated_cost_savings: parseFloat((28.00 * averageTariff).toFixed(2)),
        priority: 'Medium'
      });
    } else if (houseDetails.ventilation === 'Good') {
      recommendations.push({
        title: 'Maximize Natural Airflow During Night Hours',
        description: 'Take full advantage of your Good natural ventilation. Turning off air conditioning and opening cross-breeze windows during cooler night hours yields instant zero-cost cooling.',
        estimated_kwh_savings: 20.50,
        estimated_cost_savings: parseFloat((20.50 * averageTariff).toFixed(2)),
        priority: 'Low'
      });
    }

    // 5. General Smart Power Strip / Standby Tip
    recommendations.push({
      title: 'Eliminate Phantom / Standby Plug Loads',
      description: 'Televisions, microwave displays, laptops, and chargers draw small continuous currents when turned off at the device. Utilizing smart power strips or wall switches eliminates up to 8% of wasted idle power.',
      estimated_kwh_savings: 14.40,
      estimated_cost_savings: parseFloat((14.40 * averageTariff).toFixed(2)),
      priority: 'Low'
    });

    return recommendations;
  }
}

module.exports = RecommendationEngine;
