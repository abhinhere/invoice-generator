// components/InvoiceForm/ItemRow.js
import React from 'react';
import { Trash2 } from 'lucide-react';

const ItemRow = ({ item, onItemChange, onRemoveItem, canRemove }) => {
  const itemTotal = item.quantity * item.rate;

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 bg-white rounded-lg border border-gray-200">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Item Name
        </label>
        <input
          type="text"
          value={item.name}
          onChange={(e) => onItemChange(item.id, 'name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter item name"
        />
        <textarea
          value={item.description || ''}
          onChange={(e) => onItemChange(item.id, 'description', e.target.value)}
          className="w-full px-3 py-1 mt-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Item description (optional)"
          rows="2"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Category
        </label>
        <select
          value={item.category || 'Product'}
          onChange={(e) => onItemChange(item.id, 'category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Product">Product</option>
          <option value="Service">Service</option>
          <option value="Consulting">Consulting</option>
          <option value="Software">Software</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Quantity
        </label>
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onItemChange(item.id, 'quantity', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Rate (₹)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={item.rate}
          onChange={(e) => onItemChange(item.id, 'rate', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="flex flex-col justify-between">
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Total
          </label>
          <div className="text-lg font-semibold text-blue-600">
            ₹{itemTotal.toFixed(2)}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemoveItem(item.id)}
          disabled={!canRemove}
          className="mt-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Remove
        </button>
      </div>
    </div>
  );
};

export default ItemRow;