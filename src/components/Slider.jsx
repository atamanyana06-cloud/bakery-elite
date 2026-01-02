import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Slider.css';

const Slider = () => {
  const navigate = useNavigate();
  const slides = [
    {
      id: 1,
      title: "Твій дизайн",
      subtitle: "CUSTOM CAKES",
      description: "Завантажуй фото, і ми зробимо торт твоєї мрії.",
      details: "Надішліть нам референс або фото, оберіть начинку, і наші кондитери створять шедевр спеціально для вас! Чекаємо на вас у Bakery Elite! ❤️",
      icon: "🎨",
      link: "/constructor"
    },
    {
      id: 2,
      title: "Клуб гурманів",
      subtitle: "LOYALTY CARD",
      description: "Отримуй особисті знижки та накопичуй бонуси з кожної покупки.",
      details: "Станьте частиною нашої родини! Реєструйтеся в особистому кабінеті, накопичуйте бонуси та отримуйте ексклюзивні пропозиції щотижня.",
      icon: "💎",
      link: "/profile"
    },
    {
      id: 3,
      title: "Акції тижня",
      subtitle: "HAPPY HOUR",
      description: "Знижка 20% на всю свіжу випічку після 18:00!",
      details: "Щодня після шостої вечора ми даруємо знижку на весь асортимент свіжої випічки. Смакуйте найкраще за вигідною ціною!",
      icon: "🥐",
      link: "/catalog"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const nextSlide = () => {
    setIsExpanded(false);
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setIsExpanded(false);
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (!isExpanded) {
      const timer = setInterval(nextSlide, 7000);
      return () => clearInterval(timer);
    }
  }, [currentSlide, isExpanded]);

  return (
    <section className="modern-slider-section">
      <div className="slider-wrapper">
        <button className="nav-arrow prev" onClick={prevSlide}>❮</button>
        
        <div className={`slider-card-system ${isExpanded ? 'flipped' : ''}`}>
          {/* ПЕРЕДНЯ СТОРОНА */}
          <div className="slide-face front">
            <div className="slide-badge">{slides[currentSlide].subtitle}</div>
            
            <h1 className="slide-hero-title">
              {slides[currentSlide].title} <span className="emoji-icon">{slides[currentSlide].icon}</span>
            </h1>
            
            <p className="slide-hero-desc">{slides[currentSlide].description}</p>
            
            <div className="slide-actions">
               <button className="primary-cta" onClick={() => navigate(slides[currentSlide].link)}>
                 Дізнатися більше
               </button>
               <button className="secondary-info" onClick={() => setIsExpanded(true)}>
                 Деталі 
               </button>
            </div>

            <div className="modern-pagination">
              {slides.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`pag-bar ${idx === currentSlide ? 'active' : ''}`} 
                  onClick={() => setCurrentSlide(idx)}
                />
              ))}
            </div>
          </div>

          {/* ЗАДНЯ СТОРОНА */}
          <div className="slide-face back">
            <button className="close-icon" onClick={() => setIsExpanded(false)}>✕</button>
            <div className="back-content">
              <span className="back-subtitle">{slides[currentSlide].subtitle}</span>
              <h3>Про пропозицію</h3>
              <p>{slides[currentSlide].details}</p>
              <div className="back-footer">Твій Bakery Elite ❤️</div>
            </div>
          </div>
        </div>

        <button className="nav-arrow next" onClick={nextSlide}>❯</button>
      </div>
    </section>
  );
};

export default Slider;