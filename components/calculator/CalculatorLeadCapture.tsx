'use client';

import { useState } from 'react';
import { CalculatorStickyBar } from './CalculatorStickyBar';
import { CalculatorExitPopup } from './CalculatorExitPopup';
import { CalculatorModal } from './CalculatorModal';

export function CalculatorLeadCapture() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openCalculator = () => setIsModalOpen(true);

  return (
    <>
      <CalculatorStickyBar onOpenCalculator={openCalculator} />
      <CalculatorExitPopup
        onOpenCalculator={openCalculator}
        isModalOpen={isModalOpen}
      />
      <CalculatorModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
