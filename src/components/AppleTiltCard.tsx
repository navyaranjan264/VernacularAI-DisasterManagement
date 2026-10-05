import React, { useRef, useState, useCallback, ReactNode, CSSProperties } from 'react';

interface AppleTiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  style?: CSSProperties;
  onClick?: () => void;
  showSheen?: boolean;
}

export const AppleTiltCard: React.FC<AppleTiltCardProps> = ({
  children,
  className = '',
  maxTilt = 7,
  scale = 1.015,
  style = {},
  onClick,
  showSheen = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<CSSProperties>({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
  });
  const [sheenPosition, setSheenPosition] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const cardWidth = rect.width;
      const cardHeight = rect.height;

      // Mouse position relative to center of card (-1 to +1)
      const mouseX = (e.clientX - rect.left - cardWidth / 2) / (cardWidth / 2);
      const mouseY = (e.clientY - rect.top - cardHeight / 2) / (cardHeight / 2);

      const rotateY = mouseX * maxTilt;
      const rotateX = -mouseY * maxTilt;

      // Specular sheen coordinates (percentage 0 to 100%)
      const sheenX = ((e.clientX - rect.left) / cardWidth) * 100;
      const sheenY = ((e.clientY - rect.top) / cardHeight) * 100;

      setTiltStyle({
        transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(
          2
        )}deg) scale3d(${scale}, ${scale}, 1)`,
        transition: 'transform 0.1s ease-out',
      });

      setSheenPosition({
        x: sheenX,
        y: sheenY,
        opacity: 0.18,
      });
    },
    [maxTilt, scale]
  );

  const handleMouseLeave = useCallback(() => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
    });
    setSheenPosition((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ ...tiltStyle, ...style }}
      className={`relative overflow-hidden will-change-transform ${className}`}
    >
      {/* Specular lighting sheen overlay */}
      {showSheen && (
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            opacity: sheenPosition.opacity,
            background: `radial-gradient(circle 280px at ${sheenPosition.x}% ${sheenPosition.y}%, rgba(255, 255, 255, 0.45), transparent 70%)`,
          }}
        />
      )}
      {children}
    </div>
  );
};

export default AppleTiltCard;
