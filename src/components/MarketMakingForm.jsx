import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import api from '../api';

function MarketMakingForm({ initialData, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    exchange: '',
    symbol: '',
    quoteBudget: 10,
    minSpreadPercent: 0.3,
    mode: 'simulation',
    active: false
  });
  const [exchanges, setExchanges] = useState([]);

  useEffect(() => {
    fetchExchanges();
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const fetchExchanges = async () => {
    try {
      const res = await api.get('/exchanges');
      setExchanges((res.data.exchanges || []).filter(e => e.active));
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, quoteBudget: Number(formData.quoteBudget), minSpreadPercent: Number(formData.minSpreadPercent) });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
          <h2 className="text-xl font-bold">{initialData ? 'Editar Estratégia' : 'Nova Estratégia MM'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
            <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500" placeholder="Minha Estratégia" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Exchange</label>
            <select required name="exchange" value={formData.exchange} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500">
              <option value="">Selecione...</option>
              {exchanges.map(ex => (
                <option key={ex.acronym} value={ex.acronym}>{ex.acronym}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Par (Ex: PEPE/USDT)</label>
            <input required name="symbol" value={formData.symbol} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500" placeholder="PEPE/USDT" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Orçamento ($)</label>
              <input required type="number" step="0.01" min="0.1" name="quoteBudget" value={formData.quoteBudget} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Spread Min (%)</label>
              <input required type="number" step="0.01" min="0.01" name="minSpreadPercent" value={formData.minSpreadPercent} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500" />
            </div>
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-300 mb-1">Modo de Operação</label>
             <select name="mode" value={formData.mode} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500">
               <option value="simulation">Simulação (Apenas Logs)</option>
               <option value="live">Live (Real)</option>
             </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-300 hover:bg-gray-700 transition-colors">Cancelar</button>
            <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2 rounded flex items-center font-medium transition-colors">
              <Save size={18} className="mr-2" />
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MarketMakingForm;
