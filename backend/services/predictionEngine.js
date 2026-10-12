/**
 * Physics-Appliance Hybrid Prediction Engine
 * Computes monthly electricity consumption predictions based on appliance load profiles,
 * house architecture (room volume & height), and ventilation air-exchange metrics.
 */

class PredictionEngine {
  /**
   * Categorize appliance type for analytics charts
   */
  static categorizeAppliance(applianceType) {
    const type = applianceType.toLowerCase();
    if (type.includes('ac') || type.includes('air conditioner') || type.includes('cooler') || type.includes('hvac')) {
      return 'HVAC (Cooling/Heating)';
    }
    if (type.includes('fridge') || type.includes('refrigerator') || type.includes('freezer')) {
      return 'Refrigeration';
    }
    if (type.includes('fan')) {
      return 'Ceiling/Table Fans';
    }
    if (type.includes('light') || type.includes('led') || type.includes('lamp') || type.includes('bulb')) {
      return 'Lighting';
    }
    if (type.includes('tv') || type.includes('television') || type.includes('computer') || type.includes('laptop') || type.includes('console')) {
      return 'Entertainment & Electronics';
    }
    if (type.includes('washing') || type.includes('dryer') || type.includes('iron')) {
      return 'Laundry & Care';
    }
    if (type.includes('geyser') || type.includes('heater') || type.includes('water heater')) {
      return 'Water Heating';
    }
    if (type.includes('oven') || type.includes('microwave') || type.includes('induction') || type.includes('chimney') || type.includes('kettle')) {
      return 'Kitchen & Cooking';
    }
    return 'Other Appliances';
  }

  /**
   * Calculate Electricity Tariff Cost ($ or ₹) based on tiered consumption
   */
  static calculateEstimatedCost(totalKwh, tariffPerKwh = 0.60) {
    // Progressive slab pricing model
    let cost = 0;
    let remaining = totalKwh;

    if (remaining > 0) {
      const slab1 = Math.min(remaining, 100);
      cost += slab1 * 0.45; // Base slab
      remaining -= slab1;
    }
    if (remaining > 0) {
      const slab2 = Math.min(remaining, 200);
      cost += slab2 * 0.60; // Standard slab
      remaining -= slab2;
    }
    if (remaining > 0) {
      cost += remaining * 0.85; // High usage slab
    }

    return parseFloat(cost.toFixed(2));
  }

  /**
   * Predict monthly electricity consumption for a house & appliance configuration
   * 
   * @param {Object} houseDetails - { num_rooms, room_height_ft, ventilation, house_size_sqft, occupants_count }
   * @param {Array<Object>} appliances - List of { appliance_type, quantity, power_rating_watts, daily_usage_hours, star_rating }
   * @returns {Object} Comprehensive prediction result
   */
  static predict(houseDetails = {}, appliances = []) {
    const numRooms = parseInt(houseDetails.num_rooms || 3, 10);
    const roomHeight = parseFloat(houseDetails.room_height_ft || 10.0);
    const ventilation = houseDetails.ventilation || 'Moderate';
    const occupants = parseInt(houseDetails.occupants_count || 4, 10);

    // 1. Calculate Architecture Factors
    // Ceiling height standard baseline is 10.0 ft. Higher ceilings increase thermal volume.
    const heightFactor = parseFloat((1 + Math.max(-0.15, Math.min(0.30, (roomHeight - 10.0) * 0.04))).toFixed(2));

    // Ventilation Factor: Good ventilation reduces heat buildup & AC strain; poor ventilation increases cooling energy.
    let ventilationFactor = 1.0;
    if (ventilation === 'Good') {
      ventilationFactor = 0.94; // 6% overall HVAC efficiency benefit
    } else if (ventilation === 'Poor') {
      ventilationFactor = 1.15; // 15% added HVAC strain
    }

    // Occupancy thermal and plug-load baseline
    const occupancyFactor = 1 + (occupants - 4) * 0.02;

    const categoryBreakdown = {};
    let rawMonthlyKwh = 0;
    let hvacMonthlyKwh = 0;

    // 2. Compute individual appliance consumption
    const detailedAppliances = appliances.map((app) => {
      const qty = parseInt(app.quantity || 1, 10);
      const watts = parseFloat(app.power_rating_watts || 100);
      const hours = parseFloat(app.daily_usage_hours || 4);
      const stars = parseInt(app.star_rating || 3, 10);

      // Star rating efficiency adjustment (5-star is ~15% more efficient than 3-star, 1-star is 20% less efficient)
      let starEfficiencyFactor = 1.0;
      if (stars === 5) starEfficiencyFactor = 0.88;
      else if (stars === 4) starEfficiencyFactor = 0.94;
      else if (stars === 3) starEfficiencyFactor = 1.00;
      else if (stars === 2) starEfficiencyFactor = 1.10;
      else if (stars === 1) starEfficiencyFactor = 1.22;

      // Base formula: (Watts * Hours * Quantity * 30 days) / 1000
      const baseMonthlyKwh = (watts * hours * qty * 30 * starEfficiencyFactor) / 1000;
      const category = this.categorizeAppliance(app.appliance_type);

      const isHVAC = category === 'HVAC (Cooling/Heating)';
      const adjustedKwh = isHVAC
        ? baseMonthlyKwh * heightFactor * ventilationFactor * occupancyFactor
        : baseMonthlyKwh;

      rawMonthlyKwh += adjustedKwh;
      if (isHVAC) hvacMonthlyKwh += adjustedKwh;

      categoryBreakdown[category] = parseFloat(((categoryBreakdown[category] || 0) + adjustedKwh).toFixed(2));

      return {
        ...app,
        category,
        monthly_kwh: parseFloat(adjustedKwh.toFixed(2)),
        daily_kwh: parseFloat((adjustedKwh / 30).toFixed(2))
      };
    });

    // Baseline minimum house standby / phantom load (refrigeration, routers, standby clocks)
    const standbyLoad = Math.max(15, numRooms * 5);
    const totalPredictedMonthlyKwh = parseFloat((rawMonthlyKwh + standbyLoad).toFixed(2));
    const totalPredictedDailyKwh = parseFloat((totalPredictedMonthlyKwh / 30).toFixed(2));
    const estimatedMonthlyCost = this.calculateEstimatedCost(totalPredictedMonthlyKwh);

    return {
      model_name: 'Physics-Appliance Hybrid Engine',
      predicted_monthly_kwh: totalPredictedMonthlyKwh,
      predicted_daily_kwh: totalPredictedDailyKwh,
      estimated_cost: estimatedMonthlyCost,
      height_factor: heightFactor,
      ventilation_factor: ventilationFactor,
      occupancy_factor: parseFloat(occupancyFactor.toFixed(2)),
      standby_load_kwh: standbyLoad,
      category_breakdown: categoryBreakdown,
      appliance_count: appliances.length,
      detailed_appliances: detailedAppliances
    };
  }
}

module.exports = PredictionEngine;
