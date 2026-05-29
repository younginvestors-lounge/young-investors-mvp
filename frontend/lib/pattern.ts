export function buildPatternDataURI(): string {
  const c = "#000000";
  // opacity: 0.13 light, 0.11 dark — rendered via pattern-overlay in CSS
  const a = `fill="none" stroke="${c}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"`;
  const af = `fill="${c}" stroke="none"`;

  const g = (x: number, y: number, s: number, content: string) =>
    `<g transform="translate(${x} ${y}) scale(${s})">${content}</g>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">

    ${/* flame */ g(6, 4, 0.7,
      `<path ${a} d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>`
    )}

    ${/* rand / dollar */ g(108, 2, 0.7,
      `<line ${a} x1="12" y1="2" x2="12" y2="22"/>
       <path ${a} d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`
    )}

    ${/* wine glass */ g(210, 6, 0.68,
      `<path ${a} d="M8 22h8"/>
       <path ${a} d="M7 10h10"/>
       <path ${a} d="M12 15v7"/>
       <path ${a} d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/>`
    )}

    ${/* chef hat / cloche */ g(4, 106, 0.68,
      `<path ${a} d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/>
       <path ${a} d="M6 17h12"/>`
    )}

    ${/* candlestick chart */ g(104, 100, 0.7,
      `<path ${a} d="M9 5v4"/>
       <rect ${a} x="7" y="9" width="4" height="6" rx="1"/>
       <path ${a} d="M9 15v4"/>
       <path ${a} d="M17 3v2"/>
       <rect ${a} x="15" y="5" width="4" height="8" rx="1"/>
       <path ${a} d="M17 13v4"/>`
    )}

    ${/* trending up */ g(208, 102, 0.7,
      `<polyline ${a} points="22 7 13.5 15.5 8.5 10.5 2 17"/>
       <polyline ${a} points="16 7 22 7 22 13"/>`
    )}

    ${/* utensils / fork-knife */ g(6, 208, 0.7,
      `<path ${a} d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
       <path ${a} d="M7 2v20"/>
       <path ${a} d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>`
    )}

    ${/* receipt / ledger */ g(108, 206, 0.7,
      `<path ${a} d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
       <path ${a} d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
       <path ${a} d="M12 17.5v-11"/>`
    )}

    ${/* pie chart */ g(208, 204, 0.7,
      `<path ${a} d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
       <path ${a} d="M22 12A10 10 0 0 0 12 2v10z"/>`
    )}

    ${/* scale / balance */ g(56, 56, 0.68,
      `<path ${a} d="M12 3v16"/>
       <path ${a} d="M3 7l9-4 9 4"/>
       <path ${a} d="M6 7l-3 6c-.83 1.67 0 3 3 3s3.83-1.33 3-3z"/>
       <path ${a} d="M18 7l-3 6c-.83 1.67 0 3 3 3s3.83-1.33 3-3z"/>
       <path ${a} d="M8 19h8"/>`
    )}

    ${/* key */ g(162, 54, 0.68,
      `<circle ${a} cx="7.5" cy="15.5" r="5.5"/>
       <path ${a} d="m21 2-9.6 9.6"/>
       <path ${a} d="m15.5 7.5 3 3L22 7l-3-3"/>`
    )}

    ${/* lightning */ g(246, 56, 0.68,
      `<path ${a} d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>`
    )}

    ${/* mortar & pestle */ g(54, 154, 0.68,
      `<path ${a} d="M10 12a8 4 0 1 0 16 0 8 4 0 1 0-16 0"/>
       <path ${a} d="M6 12a12 4 0 1 0 24 0"/>
       <path ${a} d="M7 12v8"/>
       <path ${a} d="M21 12v8"/>
       <path ${a} d="M7 20a12 4 0 1 0 14 0"/>
       <path ${a} d="M22.5 7c.28-.48.5-1 .5-1.5a3.5 3.5 0 0 0-7 0c0 1.49 1 2.87 3 4"/>`
    )}

    ${/* star */ g(156, 156, 0.68,
      `<polygon ${a} points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`
    )}

    ${/* bar chart */ g(246, 154, 0.68,
      `<line ${a} x1="12" y1="20" x2="12" y2="10"/>
       <line ${a} x1="18" y1="20" x2="18" y2="4"/>
       <line ${a} x1="6"  y1="20" x2="6"  y2="16"/>`
    )}

    ${/* small dot grid accent */ ""}
    <circle ${af} cx="53"  cy="5"   r="1.2" opacity="0.5"/>
    <circle ${af} cx="155" cy="3"   r="1.2" opacity="0.5"/>
    <circle ${af} cx="255" cy="155" r="1.2" opacity="0.5"/>
    <circle ${af} cx="3"   cy="255" r="1.2" opacity="0.5"/>
    <circle ${af} cx="155" cy="255" r="1.2" opacity="0.5"/>
    <circle ${af} cx="255" cy="55"  r="1.2" opacity="0.5"/>

  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
