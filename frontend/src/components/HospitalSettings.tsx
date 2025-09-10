import React, { useState, useEffect } from 'react';
import { dropdownOptionsAPI } from '../services/api';

interface DropdownOption {
  id: string;
  category: string;
  value: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const HospitalSettings: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [newOptionValue, setNewOptionValue] = useState('');
  const [editingOption, setEditingOption] = useState<DropdownOption | null>(null);
  const [editValue, setEditValue] = useState('');

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load options when category changes
  useEffect(() => {
    if (selectedCategory) {
      loadOptions(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await dropdownOptionsAPI.getCategories();
      if (response.data.success) {
        setCategories(response.data.data);
        // Set default category if available
        if (response.data.data.length > 0) {
          setSelectedCategory(response.data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async (category: string) => {
    try {
      setLoading(true);
      const response = await dropdownOptionsAPI.getByCategory(category);
      if (response.data.success) {
        setOptions(response.data.data);
      }
    } catch (error) {
      console.error('Error loading options:', error);
      setError('Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionValue.trim() || !selectedCategory) return;

    try {
      setLoading(true);
      const response = await dropdownOptionsAPI.create({
        category: selectedCategory,
        value: newOptionValue.trim()
      });

      if (response.data.success) {
        setNewOptionValue('');
        setSuccess('Option added successfully');
        loadOptions(selectedCategory);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      console.error('Error adding option:', error);
      setError('Failed to add option');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOption = (option: DropdownOption) => {
    setEditingOption(option);
    setEditValue(option.value);
  };

  const handleUpdateOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOption || !editValue.trim()) return;

    try {
      setLoading(true);
      const response = await dropdownOptionsAPI.update(editingOption.id, {
        value: editValue.trim()
      });

      if (response.data.success) {
        setEditingOption(null);
        setEditValue('');
        setSuccess('Option updated successfully');
        loadOptions(selectedCategory);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      console.error('Error updating option:', error);
      setError('Failed to update option');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOption = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this option?')) return;

    try {
      setLoading(true);
      const response = await dropdownOptionsAPI.delete(id);

      if (response.data.success) {
        setSuccess('Option deleted successfully');
        loadOptions(selectedCategory);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      console.error('Error deleting option:', error);
      setError('Failed to delete option');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const displayNames: { [key: string]: string } = {
      'insurance': 'Insurance Companies',
      'diagnosis': 'Primary Diagnosis',
      'mobility': 'Mobility Levels',
      'transport-level': 'Transport Levels',
      'urgency': 'Urgency Levels'
    };
    return displayNames[category] || category;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hospital Settings</h2>
        <p className="text-gray-600">Manage dropdown options for transport request forms</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Category Selection */}
      <div className="mb-6">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Select Category
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a category...</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {getCategoryDisplayName(category)}
            </option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <div className="space-y-6">
          {/* Add New Option */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add New {getCategoryDisplayName(selectedCategory)}
            </h3>
            <form onSubmit={handleAddOption} className="flex gap-2">
              <input
                type="text"
                value={newOptionValue}
                onChange={(e) => setNewOptionValue(e.target.value)}
                placeholder={`Enter new ${getCategoryDisplayName(selectedCategory).toLowerCase()}...`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="submit"
                disabled={loading || !newOptionValue.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
            </form>
          </div>

          {/* Options List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Current {getCategoryDisplayName(selectedCategory)}
            </h3>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : options.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No options found for this category.</p>
                <p className="text-sm">Add some options using the form above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {options.map((option) => (
                  <div key={option.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                    {editingOption?.id === option.id ? (
                      <form onSubmit={handleUpdateOption} className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingOption(null);
                            setEditValue('');
                          }}
                          className="px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <>
                        <span className="text-gray-900">{option.value}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditOption(option)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteOption(option.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="font-semibold text-blue-900 mb-2">Instructions</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Select a category to manage its dropdown options</li>
          <li>• Add new options using the form above</li>
          <li>• Edit existing options by clicking the "Edit" button</li>
          <li>• Delete options by clicking the "Delete" button</li>
          <li>• Changes will be reflected in the transport request forms immediately</li>
        </ul>
      </div>
    </div>
  );
};

export default HospitalSettings;
