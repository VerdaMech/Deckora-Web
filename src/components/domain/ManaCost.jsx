import './ManaCost.css';

const SYMBOL_MAP = {
  W: 'w', U: 'u', B: 'b', R: 'r', G: 'g',
  C: 'c', X: 'x', Y: 'y', Z: 'z',
  T: 'tap', Q: 'untap', E: 'e', P: 'p',
  S: 's', '∞': 'infinity',
  'W/U': 'wu', 'W/B': 'wb', 'U/B': 'ub', 'U/R': 'ur',
  'B/R': 'br', 'B/G': 'bg', 'R/W': 'rw', 'R/G': 'rg',
  'G/W': 'gw', 'G/U': 'gu',
  'W/P': 'wp', 'U/P': 'up', 'B/P': 'bp', 'R/P': 'rp', 'G/P': 'gp',
  '2/W': '2w', '2/U': '2u', '2/B': '2b', '2/R': '2r', '2/G': '2g',
};

function symbolToClass(sym) {
  if (/^\d+$/.test(sym)) return `ms-${sym}`;
  return `ms-${SYMBOL_MAP[sym] ?? sym.toLowerCase()}`;
}

export function ManaCost({ cost = '' }) {
  const symbols = (cost.match(/\{[^}]+\}/g) ?? []).map(s => s.slice(1, -1));
  if (!symbols.length) return null;

  return (
    <span className="mana-cost">
      {symbols.map((sym, i) => (
        <i
          key={i}
          className={`ms ms-cost ${symbolToClass(sym)}`}
          aria-label={sym}
          title={sym}
        />
      ))}
    </span>
  );
}

export function OracleText({ text = '', className }) {
  if (!text) return null;

  const parts = text.split(/(\{[^}]+\})/);

  return (
    <p className={className}>
      {parts.map((part, i) => {
        const match = part.match(/^\{([^}]+)\}$/);
        if (match) {
          const sym = match[1];
          return (
            <i
              key={i}
              className={`ms ms-cost ${symbolToClass(sym)}`}
              aria-label={sym}
              title={sym}
            />
          );
        }
        return part.split('\n').map((line, j, arr) => (
          <span key={`${i}-${j}`}>
            {line}
            {j < arr.length - 1 && <br />}
          </span>
        ));
      })}
    </p>
  );
}

export default ManaCost;
