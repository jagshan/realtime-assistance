import React from 'react';

interface TemperatureSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const temperatureOptions = [
  { label: '0.0 - Factual', value: 0.0 },
  { label: '0.3 - Balanced', value: 0.3 },
  { label: '0.7 - Creative', value: 0.7 },
  { label: '1.0 - Wild', value: 1.0 },
];

const TemperatureSelector: React.FC<TemperatureSelectorProps> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 my-4">
      <label htmlFor="temperature" className="font-medium text-gray-300">
        Creativity (Temperature):
      </label>
      <select
        id="temperature"
        value={value}
        onChange={handleChange}
        className="w-full sm:w-auto bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
      >
        {temperatureOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TemperatureSelector;
