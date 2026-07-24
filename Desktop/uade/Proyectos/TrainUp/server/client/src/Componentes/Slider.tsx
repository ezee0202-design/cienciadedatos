// src/components/ui/Slider.tsx
import React from 'react';

type SliderProps = {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
};

export const Slider: React.FC<SliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
}) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="slider"
    />
  );
};
