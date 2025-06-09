// components/InvoiceForm/ActionButtons.js
import React from 'react';
import { FileText, RotateCcw, Save, Download } from 'lucide-react';

const ActionButtons = ({ 
  onSubmit, 
  onReset, 
  onSaveDraft, 
  onExportPDF, 
  isValid,
  totals 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Generate Invoice
          </button>
          
          <button
            type="button"
            onClick={onExportPDF}
            disabled={!isValid}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export PDF
          </button>
        </div>
        
        {/* Secondary Actions */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <button
            type="button"
            onClick={onSaveDraft}
            className="flex-1 bg-yellow-600 text-white py-3 px-6 rounded-md hover:bg-yellow-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Draft
          </button>
          
          <button
            type="button"
            onClick={onReset}
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Reset Form
          </button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Form Status: {isValid ? '✅ Ready' : '⚠️ Incomplete'}</span>
          <span>Total Amount: <strong className="text-blue-600">₹{totals.total.toFixed(2)}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;