import React, { useState, useEffect } from 'react';
import'../styles/Preloader.css';

const Preloader = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Послідовна поява шарів: 0.5с на кожен шар
    const intervals = [800, 1600, 2400, 3200, 4000]; 
    
    intervals.forEach((time, index) => {
      setTimeout(() => setStep(index + 1), time);
    });

    // Завершення анімації через 5 секунд
    setTimeout(() => {
      onComplete();
    }, 5000);
  }, [onComplete]);

  return (
    <div className="preloader-overlay">
      <div className="loader-content">
        <h1 className="loader-title animate-text">Bakery Elite</h1>
        <p className="loader-subtitle">Готуємо вашу насолоду...</p>
        
        <div className="cake-container">
          {/* Нижній корж */}
          <div className={`cake-layer layer-1 ${step >= 1 ? 'show' : ''}`}></div>
          {/* Середній корж */}
          <div className={`cake-layer layer-2 ${step >= 2 ? 'show' : ''}`}></div>
          {/* Верхній корж */}
          <div className={`cake-layer layer-3 ${step >= 3 ? 'show' : ''}`}></div>
          {/* Крем/Глазур */}
          <div className={`cake-cream ${step >= 4 ? 'show' : ''}`}></div>
          {/* Вишенька/Прикраса */}
          <div className={`cake-cherry ${step >= 5 ? 'show' : ''}`}>🍒</div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;