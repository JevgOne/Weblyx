'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CalculatorStickyBar } from './CalculatorStickyBar';
import { CalculatorExitPopup } from './CalculatorExitPopup';
import { CalculatorModal } from './CalculatorModal';

// Pages where the calculator is already embedded — hide sticky bar & exit popup
const PAGES_WITH_CALCULATOR = ['/', '/kalkulacka'];

export function CalculatorLeadCapture() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();

  const isCalcPage = PAGES_WITH_CALCULATOR.includes(pathname);

  const openCalculator = () => setIsModalOpen(true);

  return (
    <>
      {!isCalcPage && (
        <>
          <CalculatorStickyBar onOpenCalculator={openCalculator} />
          <CalculatorExitPopup
            onOpenCalculator={openCalculator}
            isModalOpen={isModalOpen}
          />
        </>
      )}
      <CalculatorModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
