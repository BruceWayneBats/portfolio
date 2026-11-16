import type { Plant } from "../shared/data";

// Рисунок растения в горшке. Форма листьев — по типу растения, цвета — из карточки товара.
export function PlantArt({ plant, className = "" }: { plant: Plant; className?: string }) {
  const { shape, leaf, pot } = plant;
  const dark = `color-mix(in srgb, ${leaf} 70%, #0b1a10)`;
  const light = `color-mix(in srgb, ${leaf} 60%, #e8f3d8)`;
  const small = shape === "succulent" || shape === "trailing";
  const potTop = small ? 150 : 160;

  const leaves = (() => {
    switch (shape) {
      case "monstera":
        return (
          <g>
            {[
              [-38, 95, 70, -30],
              [36, 88, 70, 28],
              [-6, 62, 76, -4],
              [-50, 128, 52, -55],
              [48, 124, 50, 52],
            ].map(([dx, y, r, rot], i) => (
              <g key={i} transform={`translate(${100 + dx} ${y}) rotate(${rot})`}>
                <path d={`M0 ${r * 0.62} V${-r * 0.1}`} stroke={dark} strokeWidth="3" />
                <path d={`M0 ${-r * 0.55} C ${r * 0.62} ${-r * 0.55} ${r * 0.6} ${r * 0.28} 0 ${r * 0.08} C ${-r * 0.6} ${r * 0.28} ${-r * 0.62} ${-r * 0.55} 0 ${-r * 0.55} Z`} fill={i % 2 ? leaf : dark} />
                {[-0.32, -0.12, 0.08].map((k) => (
                  <path key={k} d={`M${r * 0.1} ${r * k} L${r * 0.5} ${r * (k - 0.06)} M${-r * 0.1} ${r * k} L${-r * 0.5} ${r * (k - 0.06)}`} stroke="var(--art-bg, #fff)" strokeWidth="3.5" strokeLinecap="round" />
                ))}
              </g>
            ))}
          </g>
        );
      case "ficus":
        return (
          <g>
            <path d="M100 160 C 98 120 104 80 100 30" stroke="#6b4f3a" strokeWidth="5" fill="none" />
            {Array.from({ length: 9 }, (_, i) => {
              const y = 140 - i * 13;
              const s = i % 2 ? 1 : -1;
              return <ellipse key={i} cx={100 + s * 22} cy={y} rx="22" ry="15" transform={`rotate(${s * -25} ${100 + s * 22} ${y})`} fill={i % 3 ? leaf : dark} />;
            })}
          </g>
        );
      case "snake":
        return (
          <g>
            {[
              [-30, 70, -10],
              [-10, 34, -3],
              [12, 48, 6],
              [32, 80, 14],
              [0, 90, 0],
            ].map(([dx, top, rot], i) => (
              <g key={i} transform={`rotate(${rot} ${100 + dx} 160)`}>
                <path d={`M${100 + dx - 11} 160 C ${100 + dx - 13} ${top + 50} ${100 + dx - 4} ${top + 10} ${100 + dx} ${top} C ${100 + dx + 4} ${top + 10} ${100 + dx + 13} ${top + 50} ${100 + dx + 11} 160 Z`} fill={i % 2 ? dark : leaf} stroke={light} strokeWidth="2" />
                <path d={`M${100 + dx - 6} 150 Q ${100 + dx} 140 ${100 + dx + 6} 150 M${100 + dx - 7} 125 Q ${100 + dx} 115 ${100 + dx + 7} 125 M${100 + dx - 5} 100 Q ${100 + dx} 92 ${100 + dx + 5} 100`} stroke={light} strokeWidth="2" fill="none" opacity=".7" />
              </g>
            ))}
          </g>
        );
      case "cactus":
        return (
          <g>
            <rect x="80" y="40" width="40" height="125" rx="20" fill={leaf} />
            <path d="M120 105 h12 a10 10 0 0 0 10 -10 v-22 a9 9 0 0 1 18 0 v24 a24 24 0 0 1 -24 24 h-16 Z" fill={dark} />
            <path d="M80 120 h-10 a10 10 0 0 1 -10 -10 v-12 a8 8 0 0 0 -16 0 v14 a22 22 0 0 0 22 22 h14 Z" fill={dark} />
            {[90, 100, 110].map((x) => (
              <path key={x} d={`M${x} 48 V160`} stroke={light} strokeWidth="1.6" opacity=".6" />
            ))}
          </g>
        );
      case "trailing":
        return (
          <g>
            {[
              [70, "M78 150 C 50 170 40 200 46 214"],
              [130, "M122 150 C 150 172 160 196 152 214"],
              [100, "M100 148 C 96 175 104 196 98 214"],
              [80, "M84 148 C 70 120 76 100 90 92"],
              [118, "M116 148 C 132 122 126 104 112 96"],
            ].map(([, d], i) => (
              <path key={i} d={d as string} stroke={dark} strokeWidth="2" fill="none" />
            ))}
            {Array.from({ length: 26 }, (_, i) => {
              const paths = [
                [78, 150, 46, 214, -1],
                [122, 150, 152, 214, 1],
                [100, 148, 98, 214, 0],
                [84, 148, 90, 92, -1],
                [116, 148, 112, 96, 1],
              ];
              const [x1, y1, x2, y2, s] = paths[i % 5];
              const t = 0.2 + (Math.floor(i / 5) / 6) * 0.8;
              const x = x1 + (x2 - x1) * t + s * 14 * Math.sin(t * 3) + (i % 2 ? 6 : -6);
              const y = y1 + (y2 - y1) * t;
              return <path key={i} d={`M${x} ${y} c -8 -8 -14 4 0 12 c 14 -8 8 -20 0 -12 Z`} fill={i % 3 ? leaf : light} />;
            })}
          </g>
        );
      case "palm":
        return (
          <g>
            {[-62, -40, -18, 4, 26, 48, 68].map((a, i) => (
              <g key={a} transform={`rotate(${a} 100 160)`}>
                <path d={`M100 160 Q 102 ${100 - (i % 2) * 10} 100 ${40 + (i % 3) * 12}`} stroke={dark} strokeWidth="3" fill="none" />
                <ellipse cx="100" cy={70 + (i % 3) * 10} rx={shapeWidth(plant)} ry="44" fill={i % 2 ? leaf : dark} />
              </g>
            ))}
          </g>
        );
      case "round":
        return (
          <g>
            {Array.from({ length: 11 }, (_, i) => {
              const a = -80 + i * 16;
              const len = 50 + ((i * 37) % 30);
              const x = 100 + Math.sin((a * Math.PI) / 180) * len;
              const y = 160 - Math.cos((a * Math.PI) / 180) * len;
              return (
                <g key={i}>
                  <path d={`M100 158 Q ${(100 + x) / 2} ${y + 30} ${x} ${y}`} stroke={dark} strokeWidth="2" fill="none" />
                  <circle cx={x} cy={y} r={14 + (i % 3) * 3} fill={i % 2 ? leaf : dark} />
                  <circle cx={x} cy={y} r="2" fill={light} />
                </g>
              );
            })}
          </g>
        );
      default:
        return (
          <g transform="translate(100 140)">
            {Array.from({ length: 14 }, (_, i) => {
              const a = (i * 360) / 14 + (i > 6 ? 13 : 0);
              const r = i > 6 ? 22 : 36;
              return <path key={i} d={`M0 0 C ${-9} ${-r * 0.4} ${-6} ${-r} 0 ${-r} C 6 ${-r} 9 ${-r * 0.4} 0 0 Z`} transform={`rotate(${a}) scale(1 0.62)`} fill={i > 6 ? light : leaf} stroke={dark} strokeWidth="1" />;
            })}
          </g>
        );
    }
  })();

  return (
    <svg viewBox="0 0 200 230" className={className} aria-hidden="true">
      <ellipse cx="100" cy="222" rx="54" ry="6" fill="rgba(0,0,0,.08)" />
      {leaves}
      <path d={`M${small ? 66 : 60} ${potTop} H${small ? 134 : 140} L${small ? 126 : 130} 220 H${small ? 74 : 70} Z`} fill={pot} />
      <rect x={small ? 62 : 56} y={potTop - 6} width={small ? 76 : 88} height="14" rx="4" fill={pot} />
      <rect x={small ? 62 : 56} y={potTop + 4} width={small ? 76 : 88} height="4" fill="rgba(0,0,0,.1)" />
    </svg>
  );
}

const shapeWidth = (p: Plant) => (p.height > 100 ? 20 : 14);
