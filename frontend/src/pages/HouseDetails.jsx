import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { houseService } from '../services/houseService';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import {
  Home,
  Zap,
  Plus,
  Edit2,
  Trash2,
  Save,
  Wind,
  Layers,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  X,
  Star
} from 'lucide-react';

export default function HouseDetails() {
  const [houseDetails, setHouseDetails] = useState({
    num_rooms: 3,
    room_height_ft: 10.0,
    ventilation: 'Moderate',
    house_size_sqft: 1200,
    occupants_count: 4,
    address: ''
  });

  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingHouse, setSavingHouse] = useState(false);
  const [toast, setToast] = useState(null);

  // Appliance Modal State
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState(null);
  const [appForm, setAppForm] = useState({
    appliance_type: 'Inverter Air Conditioner (1.5 Ton)',
    quantity: 1,
    power_rating_watts: 1400,
    daily_usage_hours: 6,
    star_rating: 5
  });
  const [appSubmitting, setAppSubmitting] = useState(false);

  const commonPresets = [
    { type: 'Inverter AC (1.5 Ton)', watts: 1400, hours: 6, stars: 5 },
    { type: 'Double Door Refrigerator (350L)', watts: 220, hours: 24, stars: 4 },
    { type: 'BLDC Ceiling Fan', watts: 32, hours: 10, stars: 5 },
    { type: 'LED Lighting Set', watts: 15, hours: 6, stars: 5 },
    { type: 'Smart LED TV (55")', watts: 110, hours: 4, stars: 4 },
    { type: 'Water Heater / Geyser (25L)', watts: 2000, hours: 1.5, stars: 3 },
    { type: 'Washing Machine (Front Load)', watts: 500, hours: 1, stars: 4 },
    { type: 'Microwave Oven', watts: 1200, hours: 0.5, stars: 3 }
  ];

  const fetchHouseData = async () => {
    try {
      setLoading(true);
      const res = await houseService.getHouseData();
      if (res.success) {
        if (res.house_details) setHouseDetails(res.house_details);
        if (res.appliances) setAppliances(res.appliances);
      }
    } catch (err) {
      console.error('Failed to load house data:', err);
      setToast({ type: 'error', message: 'Failed to load house information.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseData();
  }, []);

  const handleSaveHouseDetails = async (e) => {
    e.preventDefault();
    setSavingHouse(true);
    try {
      const res = await houseService.saveHouseDetails(houseDetails);
      if (res.success) {
        setToast({ type: 'success', message: 'House details saved successfully!' });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to save house details.' });
    } finally {
      setSavingHouse(false);
    }
  };

  const openAddAppModal = () => {
    setEditingAppliance(null);
    setAppForm({
      appliance_type: 'Inverter Air Conditioner (1.5 Ton)',
      quantity: 1,
      power_rating_watts: 1400,
      daily_usage_hours: 6,
      star_rating: 5
    });
    setIsAppModalOpen(true);
  };

  const openEditAppModal = (app) => {
    setEditingAppliance(app);
    setAppForm({
      appliance_type: app.appliance_type,
      quantity: app.quantity,
      power_rating_watts: app.power_rating_watts,
      daily_usage_hours: app.daily_usage_hours,
      star_rating: app.star_rating
    });
    setIsAppModalOpen(true);
  };

  const handleAppSubmit = async (e) => {
    e.preventDefault();
    setAppSubmitting(true);
    try {
      if (editingAppliance) {
        await houseService.updateAppliance(editingAppliance.id, appForm);
        setToast({ type: 'success', message: 'Appliance updated successfully!' });
      } else {
        await houseService.addAppliance(appForm);
        setToast({ type: 'success', message: 'Appliance added to inventory!' });
      }
      setIsAppModalOpen(false);
      fetchHouseData();
    } catch (err) {
      setToast({ type: 'error', message: 'Error saving appliance.' });
    } finally {
      setAppSubmitting(false);
    }
  };

  const handleDeleteAppliance = async (id) => {
    try {
      await houseService.deleteAppliance(id);
      setToast({ type: 'success', message: 'Appliance removed.' });
      fetchHouseData();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete appliance.' });
    }
  };

  if (loading) {
    return <Loading text="Loading house details & appliances..." />;
  }

  return (
    <div className="space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            House Details & Appliance Inventory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure room dimensions, ventilation parameters, and appliances for accurate electricity predictions
          </p>
        </div>

        <Link
          to="/predictions"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Run Prediction Engine</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 1. House Architectural Parameters Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">House Architecture & Environment</h2>
            <p className="text-xs text-slate-400">Thermal volume and ventilation factors directly influence HVAC load</p>
          </div>
        </div>

        <form onSubmit={handleSaveHouseDetails} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Number of Rooms */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Number of Rooms *
              </label>
              <input
                type="number"
                min="1"
                max="25"
                required
                value={houseDetails.num_rooms}
                onChange={(e) => setHouseDetails({ ...houseDetails, num_rooms: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">Total living, bedroom, and kitchen spaces.</p>
            </div>

            {/* Room Height */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Average Ceiling Height (Feet) *
              </label>
              <input
                type="number"
                step="0.5"
                min="7"
                max="20"
                required
                value={houseDetails.room_height_ft}
                onChange={(e) => setHouseDetails({ ...houseDetails, room_height_ft: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">Standard residential height is 9.5 - 10.5 ft.</p>
            </div>

            {/* Ventilation Quality */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-sky-400" />
                Natural Ventilation Quality *
              </label>
              <select
                value={houseDetails.ventilation}
                onChange={(e) => setHouseDetails({ ...houseDetails, ventilation: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Good">Good (Cross-breeze & high window ratio - Saves ~6% HVAC)</option>
                <option value="Moderate">Moderate (Standard urban airflow - Baseline)</option>
                <option value="Poor">Poor (Enclosed / low airflow - Increases AC load ~15%)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">Directly impacts heat dissipation.</p>
            </div>

            {/* House Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                House Area (Sq. Ft.)
              </label>
              <input
                type="number"
                min="200"
                value={houseDetails.house_size_sqft || 1200}
                onChange={(e) => setHouseDetails({ ...houseDetails, house_size_sqft: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Occupants Count */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Number of Occupants
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={houseDetails.occupants_count || 4}
                onChange={(e) => setHouseDetails({ ...houseDetails, occupants_count: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Location / Address
              </label>
              <input
                type="text"
                placeholder="City or Street Address"
                value={houseDetails.address || ''}
                onChange={(e) => setHouseDetails({ ...houseDetails, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              type="submit"
              disabled={savingHouse}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingHouse ? 'Saving...' : 'Save House Parameters'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Appliance Inventory Section */}
      <div className="glass-panel rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Electrical Appliance Inventory</h2>
              <p className="text-xs text-slate-400">Add household appliances with their wattage ratings and daily operating hours</p>
            </div>
          </div>

          <button
            onClick={openAddAppModal}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Appliance</span>
          </button>
        </div>

        {appliances.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Appliance</th>
                  <th className="px-6 py-3.5 font-semibold">Qty</th>
                  <th className="px-6 py-3.5 font-semibold">Power (Watts)</th>
                  <th className="px-6 py-3.5 font-semibold">Daily Usage (Hours)</th>
                  <th className="px-6 py-3.5 font-semibold">Star Rating</th>
                  <th className="px-6 py-3.5 font-semibold">Est. Monthly Load</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {appliances.map((app) => {
                  const estMonthly = ((app.power_rating_watts * app.daily_usage_hours * app.quantity * 30) / 1000).toFixed(1);
                  return (
                    <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">
                        {app.appliance_type}
                      </td>
                      <td className="px-6 py-4 font-bold text-sky-400">
                        {app.quantity}x
                      </td>
                      <td className="px-6 py-4">
                        {app.power_rating_watts} W
                      </td>
                      <td className="px-6 py-4">
                        {app.daily_usage_hours} hrs/day
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-amber-400 gap-0.5">
                          {[...Array(app.star_rating || 3)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                          <span className="text-[10px] text-slate-400 ml-1">({app.star_rating}★)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400">
                        ~{estMonthly} kWh
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center space-x-2">
                          <button
                            onClick={() => openEditAppModal(app)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                            title="Edit appliance"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAppliance(app.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Remove appliance"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <Zap className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Appliances Added Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your household electrical appliances to calculate accurate monthly consumption and receive custom energy-saving tips.
            </p>
            <button
              onClick={openAddAppModal}
              className="mt-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
            >
              Add First Appliance
            </button>
          </div>
        )}
      </div>

      {/* Appliance Add/Edit Modal */}
      {isAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {editingAppliance ? 'Edit Appliance' : 'Add Electrical Appliance'}
                </h3>
              </div>
              <button
                onClick={() => setIsAppModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets */}
            {!editingAppliance && (
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-slate-400 mb-2">
                  Quick Select Common Appliance:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {commonPresets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAppForm({
                        appliance_type: p.type,
                        quantity: 1,
                        power_rating_watts: p.watts,
                        daily_usage_hours: p.hours,
                        star_rating: p.stars
                      })}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700 transition-colors"
                    >
                      {p.type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleAppSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Appliance Name / Type *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inverter Air Conditioner"
                  value={appForm.appliance_type}
                  onChange={(e) => setAppForm({ ...appForm, appliance_type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={appForm.quantity}
                    onChange={(e) => setAppForm({ ...appForm, quantity: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Power Rating (Watts) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={appForm.power_rating_watts}
                    onChange={(e) => setAppForm({ ...appForm, power_rating_watts: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Daily Usage (Hours/Day) *
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="24"
                    step="0.5"
                    required
                    value={appForm.daily_usage_hours}
                    onChange={(e) => setAppForm({ ...appForm, daily_usage_hours: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Energy Star Rating
                  </label>
                  <select
                    value={appForm.star_rating}
                    onChange={(e) => setAppForm({ ...appForm, star_rating: parseInt(e.target.value, 10) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value={5}>5 Stars (Highest Efficiency)</option>
                    <option value={4}>4 Stars (High Efficiency)</option>
                    <option value={3}>3 Stars (Standard)</option>
                    <option value={2}>2 Stars (Moderate)</option>
                    <option value={1}>1 Star (Low Efficiency)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAppModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={appSubmitting}
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 disabled:opacity-50"
                >
                  {appSubmitting ? 'Saving...' : editingAppliance ? 'Update Appliance' : 'Add Appliance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
