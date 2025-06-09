// components/InvoiceForm/InvoiceForm.js
import React, { useState, useEffect } from 'react';
import { Calculator, AlertCircle } from 'lucide-react';
import CustomerInfo from './CustomerInfo';
import ItemsList from './ItemsList';
import PricingSummary from './PricingSummary';
import ActionButtons from './ActionButtons';

const InvoiceForm = () => {
  // Main form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    date: new Date().toISOString().split('T')[0],
    discount: 0,
    taxRate: 0,
    notes: '',
  });

  // Items state
  const [items, setItems] = useState([
    { id: 1, name: '', description: '', category: 'Product', quantity: 1, rate: 0 }
  ]);

  // Calculated totals state
  const [totals, setTotals] = useState({
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    total: 0,
    itemCount: 0
  });

  // Validation state
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState([]);

  // Calculate totals whenever items, discount, or tax changes
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.quantity * item.rate);
    }, 0);
    
    const discountAmount = (subtotal * formData.discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * formData.taxRate) / 100;
    const total = afterDiscount + taxAmount;
    const itemCount = items.length;

    setTotals({
      subtotal,
      discountAmount,
      taxAmount,
      total,
      itemCount
    });
  }, [items, formData.discount, formData.taxRate]);

  // Validate form
  useEffect(() => {
    const newErrors = [];
    
    if (!formData.customerName.trim()) {
      newErrors.push('Customer name is required');
    }
    
    const validItems = items.filter(item => 
      item.name.trim() && item.quantity > 0 && item.rate > 0
    );
    
    if (validItems.length === 0) {
      newErrors.push('At least one valid item is required');
    }

    setErrors(newErrors);
    setIsValid(newErrors.length === 0);
  }, [formData, items]);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'discount' || name === 'taxRate' ? Number(value) || 0 : value
    }));
  };

  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { 
            ...item, 
            [field]: field === 'quantity' || field === 'rate' ? Number(value) || 0 : value 
          }
        : item
    ));
  };

  const addItem = () => {
    const newId = Math.max(...items.map(item => item.id)) + 1;
    setItems(prev => [...prev, { 
      id: newId, 
      name: '', 
      description: '', 
      category: 'Product', 
      quantity: 1, 
      rate: 0 
    }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Action handlers
  const handleSubmit = () => {
    if (!isValid) {
      alert('Please fix all errors before submitting');
      return;
    }

    const validItems = items.filter(item => 
      item.name.trim() && item.quantity > 0 && item.rate > 0
    );

    const invoiceData = {
      ...formData,
      items: validItems,
      totals,
      createdAt: new Date().toISOString()
    };

    console.log('Invoice Data:', invoiceData);
    alert('Invoice created successfully! Check console for data.');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        date: new Date().toISOString().split('T')[0],
        discount: 0,
        taxRate: 0,
        notes: '',
      });
      setItems([{ id: 1, name: '', description: '', category: 'Product', quantity: 1, rate: 0 }]);
    }
  };

  const handleSaveDraft = () => {
    const draftData = {
      formData,
      items,
      totals,
      savedAt: new Date().toISOString()
    };
    
    // Store in memory (since localStorage isn't available)
    window.invoiceDrafts = window.invoiceDrafts || [];
    window.invoiceDrafts.push(draftData);
    
    alert(`Draft saved successfully! Total drafts: ${window.invoiceDrafts.length}`);
  };

  const handleExportPDF = () => {
    if (!isValid) {
      alert('Please complete the form before exporting');
      return;
    }
    
    // This would integrate with a PDF library
    alert('PDF export feature would be implemented here');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calculator className="w-8 h-8" />
          Professional Invoice Generator
        </h1>
        <p className="text-blue-100 mt-2">Create detailed invoices with ease</p>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">Please fix the following errors:</span>
          </div>
          <ul className="mt-2 text-red-700">
            {errors.map((error, index) => (
              <li key={index} className="ml-4">• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Components */}
      <div className="space-y-6">
        <CustomerInfo 
          formData={formData} 
          onInputChange={handleInputChange} 
        />
        
        <ItemsList
          items={items}
          onItemChange={handleItemChange}
          onAddItem={addItem}
          onRemoveItem={removeItem}
        />
        
        <PricingSummary
          formData={formData}
          totals={totals}
          onInputChange={handleInputChange}
        />
        
        <ActionButtons
          onSubmit={handleSubmit}
          onReset={handleReset}
          onSaveDraft={handleSaveDraft}
          onExportPDF={handleExportPDF}
          isValid={isValid}
          totals={totals}
        />
      </div>
    </div>
  );
};

export default InvoiceForm;