'use client'

import { useState, useEffect } from 'react'
import { X, Save, User, Activity, Heart, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentData: any
  onSave: () => void
}

export function EditProfileModal({ isOpen, onClose, currentData, onSave }: EditProfileModalProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'health' | 'lifestyle' | 'dietary'>('basic')
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    
    // Health Profile
    bloodPressure: '',
    bloodSugar: '',
    cholesterol: '',
    waist: '',
    
    // Lifestyle
    sleepHours: '',
    stressLevel: '',
    activityLevel: '',
    appetite: '',
    
    // Dietary & Health
    allergies: [] as string[],
    chronicConditions: [] as string[]
  })
  
  const [currentInput, setCurrentInput] = useState({ allergy: '', condition: '' })

  useEffect(() => {
    if (currentData) {
      setFormData({
        name: currentData.identity?.name || '',
        age: currentData.identity?.age?.toString() || '',
        gender: currentData.identity?.gender || '',
        height: currentData.clinicalMetrics?.anthropometric?.height?.toString() || '',
        weight: currentData.clinicalMetrics?.anthropometric?.weight?.toString() || '',
        bloodPressure: currentData.clinicalMetrics?.metabolic?.bloodPressure || '',
        bloodSugar: currentData.clinicalMetrics?.metabolic?.bloodSugar || '',
        cholesterol: currentData.clinicalMetrics?.metabolic?.cholesterol || '',
        waist: currentData.clinicalMetrics?.anthropometric?.waist?.toString() || '',
        sleepHours: currentData.lifestyleIndicators?.sleepDuration?.toString() || '',
        stressLevel: currentData.lifestyleIndicators?.stressLevel || 'Medium',
        activityLevel: currentData.lifestyleIndicators?.activityLevel || 'Moderate',
        appetite: currentData.lifestyleIndicators?.appetite || 'Normal',
        allergies: currentData.dietaryInfo?.restrictions || [],
        chronicConditions: currentData.dietaryInfo?.chronicConditions || []
      })
    }
  }, [currentData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('nutrifusion_token')
      
      // Update basic user info
      const userResponse = await fetch('http://localhost:5000/api/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          allergies: formData.allergies,
          chronicConditions: formData.chronicConditions
        })
      })

      if (!userResponse.ok) {
        throw new Error('Failed to update user profile')
      }

      // Update health profile
      const healthResponse = await fetch('http://localhost:5000/api/health-profiles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lifestyle: {
            sleepHours: parseFloat(formData.sleepHours),
            stressLevel: formData.stressLevel,
            activityLevel: formData.activityLevel
          },
          digestionIndicators: {
            appetite: formData.appetite
          },
          metabolicMarkers: {
            bloodPressure: formData.bloodPressure,
            bloodSugar: formData.bloodSugar,
            cholesterol: formData.cholesterol
          },
          anthropometric: {
            waist: formData.waist ? parseFloat(formData.waist) : null
          }
        })
      })

      if (!healthResponse.ok) {
        throw new Error('Failed to update health profile')
      }

      alert('Profile updated successfully!')
      onSave()
      onClose()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Edit Your Profile</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex-1 py-3 px-4 font-medium transition ${
              activeTab === 'basic'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Basic Info
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`flex-1 py-3 px-4 font-medium transition ${
              activeTab === 'health'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Health Metrics
          </button>
          <button
            onClick={() => setActiveTab('lifestyle')}
            className={`flex-1 py-3 px-4 font-medium transition ${
              activeTab === 'lifestyle'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lifestyle
          </button>
          <button
            onClick={() => setActiveTab('dietary')}
            className={`flex-1 py-3 px-4 font-medium transition ${
              activeTab === 'dietary'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dietary & Health
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Age (years)</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min="1"
                      max="120"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min="50"
                      max="250"
                      step="0.1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min="20"
                      max="300"
                      step="0.1"
                      required
                    />
                  </div>
                </div>

                {/* Auto-calculated BMI preview */}
                {formData.height && formData.weight && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Calculated BMI:</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {(parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2)).toFixed(1)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Health Metrics Tab */}
            {activeTab === 'health' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Waist Circumference (cm)</label>
                  <input
                    type="number"
                    value={formData.waist}
                    onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    step="0.1"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Blood Pressure (e.g., 120/80)</label>
                  <input
                    type="text"
                    value={formData.bloodPressure}
                    onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g., 120/80"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Blood Sugar (mg/dL)</label>
                  <input
                    type="text"
                    value={formData.bloodSugar}
                    onChange={(e) => setFormData({ ...formData, bloodSugar: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g., 95 mg/dL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cholesterol (mg/dL)</label>
                  <input
                    type="text"
                    value={formData.cholesterol}
                    onChange={(e) => setFormData({ ...formData, cholesterol: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g., 180 mg/dL"
                  />
                </div>
              </div>
            )}

            {/* Lifestyle Tab */}
            {activeTab === 'lifestyle' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sleep Hours (per night)</label>
                  <input
                    type="number"
                    value={formData.sleepHours}
                    onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    min="0"
                    max="24"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stress Level</label>
                  <select
                    value={formData.stressLevel}
                    onChange={(e) => setFormData({ ...formData, stressLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Activity Level</label>
                  <select
                    value={formData.activityLevel}
                    onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="Sedentary">Sedentary (Little/no exercise)</option>
                    <option value="Moderate">Moderate (Exercise 3-5 days/week)</option>
                    <option value="Active">Active (Exercise 6-7 days/week)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Appetite</label>
                  <select
                    value={formData.appetite}
                    onChange={(e) => setFormData({ ...formData, appetite: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            )}

            {/* Dietary & Health Tab */}
            {activeTab === 'dietary' && (
              <div className="space-y-6">
                {/* Food Restrictions/Allergies */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Food Restrictions / Allergies
                  </label>
                  <p className="text-xs text-slate-500 mb-2">Press Enter to add each restriction</p>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={currentInput.allergy}
                      onChange={(e) => setCurrentInput({ ...currentInput, allergy: e.target.value })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          if (currentInput.allergy.trim() && !formData.allergies.includes(currentInput.allergy.trim())) {
                            setFormData({ ...formData, allergies: [...formData.allergies, currentInput.allergy.trim()] })
                            setCurrentInput({ ...currentInput, allergy: '' })
                          }
                        }
                      }}
                      placeholder="e.g., Dairy, Nuts, Gluten"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (currentInput.allergy.trim() && !formData.allergies.includes(currentInput.allergy.trim())) {
                          setFormData({ ...formData, allergies: [...formData.allergies, currentInput.allergy.trim()] })
                          setCurrentInput({ ...currentInput, allergy: '' })
                        }
                      }}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                      >
                        {allergy}
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            allergies: formData.allergies.filter((_, i) => i !== index)
                          })}
                          className="hover:text-red-900 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {formData.allergies.length === 0 && (
                      <span className="text-sm text-slate-400">None reported</span>
                    )}
                  </div>
                </div>

                {/* Chronic Health Conditions */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Chronic Health Conditions
                  </label>
                  <p className="text-xs text-slate-500 mb-2">Press Enter to add each condition</p>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={currentInput.condition}
                      onChange={(e) => setCurrentInput({ ...currentInput, condition: e.target.value })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          if (currentInput.condition.trim() && !formData.chronicConditions.includes(currentInput.condition.trim())) {
                            setFormData({ ...formData, chronicConditions: [...formData.chronicConditions, currentInput.condition.trim()] })
                            setCurrentInput({ ...currentInput, condition: '' })
                          }
                        }
                      }}
                      placeholder="e.g., Diabetes Type 2, Hypertension"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (currentInput.condition.trim() && !formData.chronicConditions.includes(currentInput.condition.trim())) {
                          setFormData({ ...formData, chronicConditions: [...formData.chronicConditions, currentInput.condition.trim()] })
                          setCurrentInput({ ...currentInput, condition: '' })
                        }
                      }}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.chronicConditions.map((condition, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                      >
                        {condition}
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            chronicConditions: formData.chronicConditions.filter((_, i) => i !== index)
                          })}
                          className="hover:text-orange-900 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {formData.chronicConditions.length === 0 && (
                      <span className="text-sm text-slate-400">None reported</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 p-6 flex gap-3 justify-end bg-slate-50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
