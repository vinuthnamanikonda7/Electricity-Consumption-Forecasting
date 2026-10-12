import React, { useState, useEffect } from 'react';
import { consumptionService } from '../services/consumptionService';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import {
  Zap,
  Plus,
  Search,
  ArrowUpDown,
  Download,
  Trash2,
  Edit2,
  Calendar,
  FileText,
  X,
  Check,
  Filter,
  Sparkles
} from 'lucide-react';

export default function Consumption() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [toast, setToast] = useState(null);

  // Filter & Sort State
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('reading_date');
  const [order, setOrder] = useState('DESC');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState(null);
  const [formData, setFormData] = useState({
    reading_date: new Date().toISOString().split('T')[0],
    consumption: '',
    units: 'kWh',
    notes: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchReadings = async () => {
    try {
      setLoading(true);
      const res = await consumptionService.getReadings({
        search,
        sortBy,
        order
      });
      if (res.success) {
        setReadings(res.readings);
      }
    } catch (err) {
      console.error('Failed to fetch readings:', err);
      setToast({ type: 'error', message: 'Failed to retrieve electricity readings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReadings();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, sortBy, order]);

  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      const res = await consumptionService.seedDemoReadings();
      if (res.success) {
        setToast({
          type: 'success',
          message: `Loaded ${res.count} days of sample meter readings successfully!`
        });
        await fetchReadings();
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to seed sample readings.'
      });
    } finally {
      setSeeding(false);
    }
  };

  const openAddModal = () => {
    setEditingReading(null);
    setFormData({
      reading_date: new Date().toISOString().split('T')[0],
      consumption: '',
      units: 'kWh',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (reading) => {
    setEditingReading(reading);
    setFormData({
      reading_date: reading.reading_date,
      consumption: reading.consumption,
      units: reading.units || 'kWh',
      notes: reading.notes || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReading(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reading_date || formData.consumption === '') {
      setToast({ type: 'error', message: 'Date and consumption are required.' });
      return;
    }

    const num = parseFloat(formData.consumption);
    if (isNaN(num) || num < 0) {
      setToast({ type: 'error', message: 'Consumption must be a valid positive number.' });
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingReading) {
        await consumptionService.updateReading(editingReading.id, formData);
        setToast({ type: 'success', message: 'Reading updated successfully!' });
      } else {
        await consumptionService.createReading(formData);
        setToast({ type: 'success', message: 'Consumption reading saved successfully!' });
      }
      closeModal();
      fetchReadings();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error saving consumption record.';
      setToast({ type: 'error', message: msg });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await consumptionService.deleteReading(id);
      setToast({ type: 'success', message: 'Reading deleted successfully.' });
      setDeleteConfirmId(null);
      fetchReadings();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete record.' });
    }
  };

  const exportCSV = () => {
    if (readings.length === 0) {
      setToast({ type: 'info', message: 'No readings available to export.' });
      return;
    }

    const headers = ['ID', 'Reading Date', 'Consumption', 'Units', 'Notes', 'Created At'];
    const rows = readings.map(r => [
      r.id,
      r.reading_date,
      r.consumption,
      r.units,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
      r.created_at
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `electricity_readings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({ type: 'success', message: 'Exported readings to CSV successfully.' });
  };

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Electricity Consumption Data
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage and track your daily electricity meter readings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedDemo}
            disabled={seeding}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Preload 30 days of realistic sample readings"
          >
            {seeding ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Loading...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">⚡ Sample 30 Days</span>
              </>
            )}
          </button>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
            title="Export to CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Consumption</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by date or notes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="reading_date">Date</option>
            <option value="consumption">Consumption</option>
            <option value="created_at">Created Time</option>
          </select>

          <button
            onClick={() => setOrder(order === 'ASC' ? 'DESC' : 'ASC')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs flex items-center"
            title={`Toggle order (${order})`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-12">
            <Loading text="Retrieving electricity records..." />
          </div>
        ) : readings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Reading Date</th>
                  <th className="px-6 py-3.5 font-semibold">Consumption</th>
                  <th className="px-6 py-3.5 font-semibold">Unit</th>
                  <th className="px-6 py-3.5 font-semibold">Notes / Remarks</th>
                  <th className="px-6 py-3.5 font-semibold">Recorded At</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {readings.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      {r.reading_date}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400 text-sm">
                      {parseFloat(r.consumption).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                        {r.units || 'kWh'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate">
                      {r.notes || <span className="text-slate-600 italic">No notes</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-[11px]">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : '--'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                          title="Edit reading"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {deleteConfirmId === r.id ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded text-[11px] font-bold"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(r.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete reading"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <Zap className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Readings Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search ? 'No readings match your search criteria. Try a different query.' : 'You have not added any electricity consumption data yet.'}
            </p>
            <button
              onClick={openAddModal}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              Add First Reading
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {editingReading ? 'Edit Consumption Reading' : 'Add Electricity Reading'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reading Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.reading_date}
                  onChange={(e) => setFormData({ ...formData, reading_date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Consumption *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 14.50"
                    value={formData.consumption}
                    onChange={(e) => setFormData({ ...formData, consumption: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Unit
                  </label>
                  <select
                    value={formData.units}
                    onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="kWh">kWh</option>
                    <option value="MWh">MWh</option>
                    <option value="Units">Units</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes / Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Heavy AC usage, weekend laundry"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingReading ? 'Update Reading' : 'Save Reading'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
