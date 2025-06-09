// components/InvoiceForm/ItemsList.js
import React from 'react';
import { Plus } from 'lucide-react';
import ItemRow from './ItemRow';

const ItemsList = ({ items, onItemChange, onAddItem, onRemoveItem }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Items</h2>
        <button
          type="button"
          onClick={onAddItem}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onItemChange={onItemChange}
            onRemoveItem={onRemoveItem}
            canRemove={items.length > 1}
          />
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No items added yet. Click "Add Item" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ItemsList;