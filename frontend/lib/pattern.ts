import type { ThemeMode } from "./types";

export function buildPatternDataURI(theme: ThemeMode): string {
  const c = theme === "dark" ? "#ffffff" : "#000000";
  const a = `fill="none" stroke="${c}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"`;

  const g = (x: number, y: number, s: number, content: string) =>
    `<g transform="translate(${x} ${y}) scale(${s})">${content}</g>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    ${g(8, 6, 0.68,
      `<path ${a} d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>`
    )}
    ${g(104, 4, 0.68,
      `<line ${a} x1="12" y1="2" x2="12" y2="22"/>
       <path ${a} d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`
    )}
    ${g(162, 36, 0.68,
      `<path ${a} d="M8 22h8"/>
       <path ${a} d="M7 10h10"/>
       <path ${a} d="M12 15v7"/>
       <path ${a} d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/>`
    )}
    ${g(4, 100, 0.65,
      `<path ${a} d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/>
       <path ${a} d="M6 17h12"/>`
    )}
    ${g(100, 96, 0.68,
      `<polyline ${a} points="22 7 13.5 15.5 8.5 10.5 2 17"/>
       <polyline ${a} points="16 7 22 7 22 13"/>`
    )}
    ${g(158, 108, 0.68,
      `<path ${a} d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
       <path ${a} d="M7 2v20"/>
       <path ${a} d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>`
    )}
    ${g(36, 162, 0.68,
      `<path ${a} d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
       <path ${a} d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
       <path ${a} d="M12 17.5v-11"/>`
    )}
    ${g(143, 154, 0.68,
      `<path ${a} d="M2 12h20"/>
       <path ${a} d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/>
       <path ${a} d="m4 8 16-4"/>`
    )}
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
