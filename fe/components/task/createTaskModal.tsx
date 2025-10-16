/**
 * Create Task Modal
 * 
 * User-friendly modal for creating a new task with milestones
 * Hides blockchain complexity and presents task-oriented interface
 */

'use client';

import React, { useState } from 'react';
import { X, AlertCircle, Loader2, Plus, Trash2, Clock, Target } from 'lucide-react';
import { createLiquidityPool, toMicroStx, toMicroUsdt } from '@/lib/vault-contract';
import { addTaskMetadata } from '@/lib/task-metadata';
import { UnlockType } from '@/types/task';
import { cn } from '@/lib/utils';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface MilestoneInput {
  id: string;
  title: string;
  description: string;
  unlockType: UnlockType;
  unlockValue: string; // block height for timestamp, ignored for manual
}

export function CreateTaskModal({ isOpen, onClose, onSuccess }: CreateTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
  // Task info
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  
  // Milestones
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { id: '1', title: '', description: '', unlockType: 'timestamp', unlockValue: '144' }
  ]);

  if (!isOpen) return null;

  const addMilestone = () => {
    if (milestones.length >= 10) {
      setError('Maximum 10 milestones allowed');
      return;
    }
    setMilestones([
      ...milestones,
      { 
        id: Date.now().toString(), 
        title: '', 
        description: '', 
        unlockType: 'timestamp', 
        unlockValue: '144' 
      }
    ]);
  };

  const removeMilestone = (id: string) => {
    if (milestones.length <= 1) {
      setError('At least one milestone is required');
      return;
    }
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const updateMilestone = (id: string, field: keyof MilestoneInput, value: string) => {
    setMilestones(milestones.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleStep1Next = () => {
    setError(null);
    
    if (!taskTitle.trim()) {
      setError('Please enter a task title');
      return;
    }

    if (!taskDescription.trim()) {
      setError('Please enter a task description');
      return;
    }

    setCurrentStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate milestones
    for (let i = 0; i < milestones.length; i++) {
      const m = milestones[i];
      if (!m.title.trim()) {
        setError(`Please enter a title for milestone ${i + 1}`);
        return;
      }
      if (!m.description.trim()) {
        setError(`Please enter a description for milestone ${i + 1}`);
        return;
      }
      if (m.unlockType === 'timestamp') {
        const blocks = parseInt(m.unlockValue);
        if (isNaN(blocks) || blocks <= 0) {
          setError(`Please enter a valid block duration for milestone ${i + 1}`);
          return;
        }
      }
    }

    try {
      setIsLoading(true);
      
      // For now, we use placeholder amounts for STX/USDT
      // In a real implementation, these could be hidden or removed
      const placeholderStx = toMicroStx(10);
      const placeholderUsdt = toMicroUsdt(100);
      const zoneCount = milestones.length;
      const zoneDuration = parseInt(milestones[0].unlockValue) || 144;

      // Create the pool (blockchain transaction)
      const result = await createLiquidityPool(
        placeholderStx,
        placeholderUsdt,
        zoneCount,
        zoneDuration
      );

      if (result.success) {
        // Save task metadata (off-chain)
        // TODO: Get the actual pool ID from the transaction result
        // For now, we'll need to handle this differently
        // The metadata should be saved with the correct pool ID after creation
        
        // Success - close modal and refresh
        onClose();
        if (onSuccess) {
          onSuccess();
        }
        
        // Refresh page to show new task
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(result.error || 'Failed to create task');
      }
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      // Reset form
      setTaskTitle('');
      setTaskDescription('');
      setMilestones([
        { id: '1', title: '', description: '', unlockType: 'timestamp', unlockValue: '144' }
      ]);
      setCurrentStep(1);
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-sky-500 px-6 py-5 flex-shrink-0">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-white mb-2">
            Create New Task
          </h2>
          <p className="text-blue-100 text-sm">
            {currentStep === 1 ? 'Set up your task details' : 'Define your milestones'}
          </p>
          
          {/* Step Indicator */}
          <div className="flex gap-2 mt-4">
            <div className={cn(
              "flex-1 h-1 rounded-full transition-all",
              currentStep >= 1 ? "bg-white" : "bg-white/30"
            )} />
            <div className={cn(
              "flex-1 h-1 rounded-full transition-all",
              currentStep >= 2 ? "bg-white" : "bg-white/30"
            )} />
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3 mb-5">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Task Details */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
                  placeholder="e.g., Complete Python Learning Path"
                  maxLength={100}
                />
                <p className="mt-1 text-xs text-gray-500">
                  A clear, concise title for your task
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Task Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  required
                  disabled={isLoading}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 resize-none"
                  placeholder="Describe what this task is about and what you'll achieve..."
                  maxLength={300}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Help others understand what this task involves
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Next Step</h4>
                    <p className="text-xs text-blue-800">
                      After setting up your task details, you'll define the milestones that need to be completed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Milestones */}
          {currentStep === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Milestones ({milestones.length}/10)
                  </h3>
                  <button
                    type="button"
                    onClick={addMilestone}
                    disabled={milestones.length >= 10}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Add Milestone
                  </button>
                </div>

                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div
                      key={milestone.id}
                      className="border-2 border-gray-200 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">
                          Milestone {index + 1}
                        </span>
                        {milestones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMilestone(milestone.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                          placeholder="Milestone title"
                          disabled={isLoading}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
                          maxLength={80}
                        />
                      </div>

                      <div>
                        <textarea
                          value={milestone.description}
                          onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                          placeholder="Describe what needs to be completed..."
                          disabled={isLoading}
                          rows={2}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 resize-none"
                          maxLength={200}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Unlock Type
                          </label>
                          <select
                            value={milestone.unlockType}
                            onChange={(e) => updateMilestone(milestone.id, 'unlockType', e.target.value as UnlockType)}
                            disabled={isLoading}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
                          >
                            <option value="timestamp">Time-based</option>
                            <option value="manual">Manual</option>
                          </select>
                        </div>

                        {milestone.unlockType === 'timestamp' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Unlock After (blocks)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={milestone.unlockValue}
                              onChange={(e) => updateMilestone(milestone.id, 'unlockValue', e.target.value)}
                              disabled={isLoading}
                              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
                              placeholder="144"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Task Summary</h4>
                <div className="space-y-1 text-xs text-blue-800">
                  <div className="flex justify-between">
                    <span>Task Title:</span>
                    <span className="font-medium">{taskTitle || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Milestones:</span>
                    <span className="font-medium">{milestones.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time-based Unlocks:</span>
                    <span className="font-medium">
                      {milestones.filter(m => m.unlockType === 'timestamp').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Manual Unlocks:</span>
                    <span className="font-medium">
                      {milestones.filter(m => m.unlockType === 'manual').length}
                    </span>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          {currentStep === 1 ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 py-3 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStep1Next}
                disabled={isLoading}
                className="flex-1 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 transition-all disabled:opacity-50"
              >
                Next: Milestones
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                disabled={isLoading}
                className="flex-1 py-3 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className={cn(
                  "flex-1 py-3 rounded-lg font-medium text-white",
                  "bg-gradient-to-r from-blue-600 to-sky-500",
                  "hover:from-blue-700 hover:to-sky-600",
                  "transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Task...
                  </>
                ) : (
                  'Create Task'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
