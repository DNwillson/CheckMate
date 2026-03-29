import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const CreateNewTrip = ({ onBack, onSave, theme }) => {
  const [name, setName] = useState('');
  const [items, setItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');

  const addItem = () => {
    if (!newItemText.trim()) return;
    setItems([...items, { id: Date.now(), text: newItemText, critical: false, assignedTo: 'me' }]);
    setNewItemText('');
  };

  const handleSave = () => {
    if (!name || items.length === 0) return;
    onSave({
      id: Date.now().toString(),
      name,
      icon: 'Backpack',
      theme: { bg: theme.primaryLight, text: theme.primaryText },
      items
    });
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col`}>
       <div className={`sticky top-0 z-20 ${theme.bg}/90 backdrop-blur-md px-4 h-16 flex items-center justify-between border-b border-[#F0F0F0]`}>
        <button onClick={onBack} className="text-[#9A9A9A] font-medium">Cancel</button>
        <span className={`font-bold ${theme.textMain}`}>New Trip</span>
        <button onClick={handleSave} disabled={!name || items.length === 0} className={`font-bold ${!name || items.length === 0 ? 'text-[#D1D1D1]' : theme.primaryText}`}>Save</button>
      </div>
      <div className="p-6 space-y-8 pb-32 overflow-y-auto">
        <div>
          <label className={`block text-xs font-bold ${theme.textSub} mb-3 ml-1`}>Name</label>
          <input type="text" placeholder="e.g., Beach trip..." className={`w-full text-xl py-3 px-4 bg-white rounded-2xl shadow-sm border-2 border-transparent focus:${theme.primaryBorder} outline-none ${theme.textMain} placeholder-[#D1D1D1]`} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className={`block text-xs font-bold ${theme.textSub} mb-3 ml-1`}>Checklist</label>
          <div className="space-y-3 mb-4">
             {items.map(item => (
               <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                  <span className={theme.textMain}>{item.text}</span>
                  <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-[#D1D1D1] hover:text-[#D98282]"><Trash2 size={18} /></button>
               </div>
             ))}
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-2 flex items-center">
             <input type="text" placeholder="Add item..." className="flex-1 bg-transparent px-3 outline-none text-[#5C5C5C]" value={newItemText} onChange={e => setNewItemText(e.target.value)} onKeyPress={e => e.key === 'Enter' && addItem()} />
             <button onClick={addItem} disabled={!newItemText} className={`p-3 rounded-xl ${newItemText ? theme.primary + ' text-white' : 'bg-[#F5F5F5] text-[#D1D1D1]'}`}><Plus size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewTrip;