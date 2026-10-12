/**
 * Forecast Service
 * Handles calculation and generation of electricity consumption predictions.
 * Currently implements Moving Average forecasting with extensible interface for ML models.
 */

class ForecastService {
  /**
   * Generates a Moving Average forecast based on historical electricity readings.
   * 
   * @param {Array<{reading_date: string, consumption: number}>} readings - User's historical readings sorted chronologically
   * @param {number} horizonDays - Forecast period in days (1, 7, or 30)
   * @param {number} windowSize - Moving average window size (default: 7)
   * @returns {Object} Forecast results containing prediction points and summary metrics
   */
  static calculateMovingAverage(readings, horizonDays = 7, windowSize = 7) {
    if (!readings || readings.length === 0) {
      throw new Error('At least 1 historical reading is required to generate a forecast.');
    }

    // Convert consumption values to floats and ensure sorted by date ascending
    const sortedReadings = [...readings].sort(
      (a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime()
    );

    const values = sortedReadings.map(r => parseFloat(r.consumption));
    const count = values.length;

    // Use available readings if total count is smaller than requested windowSize
    const actualWindow = Math.min(count, windowSize);
    const windowSlice = values.slice(count - actualWindow);
    const sum = windowSlice.reduce((acc, curr) => acc + curr, 0);
    const baseAverage = parseFloat((sum / actualWindow).toFixed(2));

    // Calculate baseline standard deviation / variance to estimate range
    const variance = windowSlice.reduce((acc, curr) => acc + Math.pow(curr - baseAverage, 2), 0) / actualWindow;
    const stdDev = parseFloat(Math.sqrt(variance).toFixed(2));

    // Determine the base date from the latest historical reading
    const lastReading = sortedReadings[sortedReadings.length - 1];
    const baseDate = new Date(lastReading.reading_date);

    const predictions = [];

    for (let i = 1; i <= horizonDays; i++) {
      const forecastDate = new Date(baseDate);
      forecastDate.setDate(baseDate.getDate() + i);
      const dateString = forecastDate.toISOString().split('T')[0];

      // Small deterministic day-of-week cycle variation (weekend vs weekday multiplier)
      // to provide realistic slight day-to-day fluctuations around the moving average
      const dayOfWeek = forecastDate.getDay();
      const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
      const factor = isWeekend ? 1.05 : 0.98; // slight 5% increase on weekends
      
      const predictedValue = Math.max(0.1, parseFloat((baseAverage * factor).toFixed(2)));

      predictions.push({
        date: dateString,
        predicted_consumption: predictedValue,
        lower_bound: Math.max(0, parseFloat((predictedValue - stdDev).toFixed(2))),
        upper_bound: parseFloat((predictedValue + stdDev).toFixed(2)),
        model_name: 'Moving Average',
        horizon_days: horizonDays
      });
    }

    const totalPredicted = parseFloat(predictions.reduce((acc, p) => acc + p.predicted_consumption, 0).toFixed(2));
    const averageDailyPredicted = parseFloat((totalPredicted / horizonDays).toFixed(2));

    return {
      model_name: 'Moving Average',
      horizon_days: horizonDays,
      window_size: actualWindow,
      readings_used: actualWindow,
      total_historical_readings: count,
      base_moving_average: baseAverage,
      standard_deviation: stdDev,
      total_predicted_consumption: totalPredicted,
      average_daily_predicted: averageDailyPredicted,
      latest_historical_date: lastReading.reading_date,
      predictions
    };
  }
}

module.exports = ForecastService;
