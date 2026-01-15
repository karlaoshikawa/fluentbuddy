import React, { useEffect, useState } from 'react';
import { Checkmark, Trophy } from '@carbon/icons-react';

interface RequirementNotificationProps {
  show: boolean;
  requirementName: string;
  onClose: () => void;
}

export function RequirementNotification({ show, requirementName, onClose }: RequirementNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-200 p-6 max-w-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Trophy size={24} className="text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Checkmark size={20} className="text-green-600" />
              <h3 className="font-bold text-gray-900">Requisito Dominado!</h3>
            </div>
            <p className="text-sm text-gray-600">{requirementName}</p>
            <p className="text-xs text-green-600 mt-2">🎉 Marcado como completo automaticamente</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sistema global de notificações
let notificationCallback: ((name: string) => void) | null = null;

export function setNotificationCallback(callback: (name: string) => void) {
  notificationCallback = callback;
}

export function showRequirementNotification(requirementName: string) {
  if (notificationCallback) {
    notificationCallback(requirementName);
  }
}
