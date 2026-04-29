import React from "react";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";
import { colors, wheelColors } from "../screens/colors";

// Un petit nuancier de 3 couleurs pour l'alternance
// const wheelColors = ["#FF8080", "#80FF80", "#8080FF"]; // Rouge, Vert, Bleu pastel

export default function WheelSvg({ guests, size }) {
  const radius = size / 2;
  const anglePerSegment = 360 / guests?.length;

  // Fonction pour générer le chemin (Path) d'un segment
  const createArc = (index) => {
    const startAngle = index * anglePerSegment;
    const endAngle = (index + 1) * anglePerSegment;

    // Conversion degrés -> radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Coordonnées des points sur le cercle
    const startX = radius + radius * Math.cos(startRad);
    const startY = radius + radius * Math.sin(startRad);
    const endX = radius + radius * Math.cos(endRad);
    const endY = radius + radius * Math.sin(endRad);

    // Flag pour l'arc (grand ou petit)
    const largeArcFlag = anglePerSegment <= 180 ? "0" : "1";

    // Commande de dessin SVG (M: MoveTo, A: ArcTo, L: LineTo, Z: ClosePath)
    return `M${radius},${radius} L${startX},${startY} A${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY} Z`;
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <G>
        {guests?.map((guest, index) => (
          <G key={index}>
            {/* 1. Le Segment Coloré */}
            <Path
              d={createArc(index)}
              fill={wheelColors[index % wheelColors.length]} // Alternance de 3 couleurs
              stroke="white" // La bordure nette entre les segments
              strokeWidth="2"
            />

            {/* 2. Le Texte (en SVG pour qu'il suive la rotation) */}
            {/* C'est ici qu'on positionne le texte au milieu de la part */}
            <SvgText
              x={
                radius +
                (radius / 1.5) *
                  Math.cos(
                    ((index * anglePerSegment + anglePerSegment / 2) *
                      Math.PI) /
                      180,
                  )
              }
              y={
                radius +
                (radius / 1.5) *
                  Math.sin(
                    ((index * anglePerSegment + anglePerSegment / 2) *
                      Math.PI) /
                      180,
                  )
              }
              fill={colors.text}
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle" // Centre le texte sur son point d'ancrage
              alignmentBaseline="middle" // Centre verticalement
              transform={`rotate(${index * anglePerSegment + anglePerSegment / 2} ${radius + (radius / 1.5) * Math.cos(((index * anglePerSegment + anglePerSegment / 2) * Math.PI) / 180)} ${radius + (radius / 1.5) * Math.sin(((index * anglePerSegment + anglePerSegment / 2) * Math.PI) / 180)})`}
            >
              {guest.name[0].toUpperCase() + guest.name.slice(1).toLowerCase()}
            </SvgText>
          </G>
        ))}
      </G>
    </Svg>
  );
}
