export function CampusMapArtwork() {
  return (
    <svg
      className="w-full h-full object-cover max-[900px]:min-w-162.5"
      viewBox="0 0 800 420"
      aria-hidden="true"
    >
      <defs>
        <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".7" className="fill-[#bccac3]" />
        </pattern>
      </defs>
      <rect width="800" height="420" className="fill-[#eaf0e9]" />
      <rect width="800" height="420" fill="url(#dots)" />
      <path
        d="M-20 340Q200 240 280 295T850 220"
        fill="none"
        className="stroke-[#cbded8]"
        strokeWidth="60"
      />
      <path
        d="M0 155H800M350 0v440M0 330h800M610 0v440"
        fill="none"
        className="stroke-panel"
        strokeWidth="23"
      />
      <path
        d="M0 155H800M350 0v440M0 330h800M610 0v440"
        fill="none"
        className="stroke-[#cdd5ca]"
        strokeWidth="1"
        strokeDasharray="5 6"
      />
      {[
        [85, 42, 140, 55],
        [405, 56, 140, 50],
        [447, 205, 106, 68],
        [650, 50, 110, 70],
        [675, 205, 80, 70],
        [75, 210, 130, 60],
        [405, 360, 140, 60],
      ].map(([x, y, w, h], i) => (
        <g key={i}>
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            rx="7"
            className="fill-[#dce3d7] stroke-[#c8d2c2]"
          />
          <rect
            x={x + 8}
            y={y + 8}
            width={w - 16}
            height={h - 16}
            rx="3"
            className="fill-[#e7ebdf]"
          />
        </g>
      ))}
      <ellipse cx="520" cy="140" rx="43" ry="28" className="fill-[#d2e1c7]" />
      <text x="440" y="90" className="fill-[#475e4b]" fontSize="13">
        LIBRARY
      </text>
      <text x="70" y="240" className="fill-[#475e4b]" fontSize="13">
        STUDENT COMMONS
      </text>
      <text x="650" y="90" className="fill-[#475e4b]" fontSize="12">
        SCIENCE BLOCK
      </text>
      <text x="426" y="393" className="fill-[#475e4b]" fontSize="13">
        SPORTS CENTRE
      </text>
    </svg>
  );
}
