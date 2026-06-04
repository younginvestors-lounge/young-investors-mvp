/**
 * Gordon's Glossary — the heart of Young Investors.
 *
 * Every finance term is translated into a cooking idea, then explained at FOUR
 * levels so a 5-year-old, a 12-year-old, an 18-year-old new to money, and a
 * 45-year-old finance pro all walk away understanding it. Occam's razor: the
 * simplest true explanation wins. Each entry cross-links to related terms, so the
 * glossary is a *matrix* — the cooking ideas connect and stay transferable.
 *
 * MOCK_MVP_PAPER_TRADING_ONLY — teaching only, never financial advice.
 */

export interface GlossaryLevels {
  /** A 5-year-old. Tiny words, a picture they can see. */
  five: string;
  /** A 12-year-old. Concrete, a school example. */
  twelve: string;
  /** An 18-year-old brand new to money. Plain, practical. */
  eighteen: string;
  /** A 45-year-old finance pro. Precise, with the real nuance. */
  fortyFive: string;
}

export interface GlossaryEntry {
  key: string;
  /** The finance term. */
  term: string;
  /** The Young Investors cooking name. */
  kitchen: string;
  /** One-line cooking metaphor. */
  cooking: string;
  /** One slang line — accessible, fun, true. */
  slang: string;
  levels: GlossaryLevels;
  /** Cross-links (other keys) — the matrix of connected ideas. */
  related: string[];
  /** Optional note on where the word/idea comes from. */
  origin?: string;
}

export type GordonHeatCheckConcept =
  | "selected-stock"
  | "top-40-index"
  | "opening-price"
  | "closing-price"
  | "adjusted-price"
  | "trend-analysis"
  | "market-shock"
  | "stability"
  | "drawdown"
  | "price-gap"
  | "heat-check"
  | "news-context"
  | "data-confidence";

export const GLOSSARY_LIST: GlossaryEntry[] = [
  {
    key: "stock",
    term: "Stock / Share",
    kitchen: "A slice of the restaurant",
    cooking: "Owning a share is owning one slice of a whole restaurant. The restaurant does well, your slice is worth more.",
    slang: "A share = you own a lil piece of the company, no cap.",
    levels: {
      five: "It's owning a tiny piece of a big shop. If the shop does well, your piece is worth more.",
      twelve: "A share is a small piece of a company you can buy. If the company grows, your piece can be worth more; if it shrinks, less.",
      eighteen: "A share makes you a part-owner of a company. You can gain two ways: the price rises, or the company pays you a slice of its profit (a dividend).",
      fortyFive: "Common equity: a residual claim on a firm's assets and earnings. Returns come from price appreciation and dividends; equity sits behind debt in the capital structure.",
    },
    related: ["dividend", "index", "portfolio", "return"],
    origin: "'Stock' comes from the old idea of holding a stake in a shared venture.",
  },
  {
    key: "portfolio",
    term: "Portfolio",
    kitchen: "The Vault — your whole menu",
    cooking: "Every dish you're cooking at once. A good menu has variety so one bad dish doesn't sink the night.",
    slang: "Your portfolio = everything you're holding. We call it your Vault.",
    levels: {
      five: "All the things you own, kept together — like your whole lunchbox.",
      twelve: "Your portfolio is everything you've invested in, added up. In here we call it your Vault.",
      eighteen: "A portfolio is your full set of holdings. The mix matters more than any single pick — that mix is your real risk.",
      fortyFive: "The aggregate of positions whose joint distribution — not the marginals — drives realised risk and return. Allocation and covariance dominate selection.",
    },
    related: ["diversification", "asset-allocation", "risk", "stock"],
  },
  {
    key: "risk",
    term: "Risk",
    kitchen: "Heat",
    cooking: "Heat cooks the dish. Too much and you burn the kitchen down and can't cook tomorrow.",
    slang: "Risk = how badly this could go wrong. Don't bet the whole pot.",
    levels: {
      five: "The chance something goes wrong. Like running with a full cup — it might spill.",
      twelve: "Risk is the chance you lose money. More reward usually means more risk. The trick is never losing so much you can't keep playing.",
      eighteen: "Risk is the chance of loss and how big it could be. The real rule: size your bets so one wrong call can't end you.",
      fortyFive: "Dispersion of outcomes — volatility, drawdown, tail risk. Survivability (avoiding risk-of-ruin) and position sizing dominate naive expected-value chasing.",
    },
    related: ["return", "position-size", "volatility", "diversification"],
  },
  {
    key: "return",
    term: "Return",
    kitchen: "The flavour you get back",
    cooking: "What the dish gives back for the effort and heat you put in.",
    slang: "Return = what you got back vs what you put in. Profit, basically.",
    levels: {
      five: "What you get back. Put in R1, later you have R1.10 — you got 10c back.",
      twelve: "Return is how much you gained or lost, as a percent. +10% means R100 became R110.",
      eighteen: "Return is your gain or loss over what you put in, usually a %. Judge it against the risk you took, not just the number.",
      fortyFive: "Total return = price change + income, ideally risk-adjusted (Sharpe, vs a benchmark). Naked return without a risk frame is noise.",
    },
    related: ["risk", "benchmark", "compounding"],
  },
  {
    key: "diversification",
    term: "Diversification",
    kitchen: "A balanced plate",
    cooking: "Don't serve five meat dishes and call it balance. Mix things that behave differently.",
    slang: "Diversify = don't put all your eggs in one pot. Spread it.",
    levels: {
      five: "Don't put all your sweets in one pocket. If it rips, you lose them all.",
      twelve: "Spreading your money across different things, so if one drops, the others can hold you up.",
      eighteen: "Owning things that don't all move together. When one zigs, another zags — your whole plate is steadier.",
      fortyFive: "Combining imperfectly-correlated assets to cut portfolio variance without proportionally sacrificing expected return — the closest thing to a free lunch.",
    },
    related: ["portfolio", "correlation", "risk", "asset-allocation"],
  },
  {
    key: "volatility",
    term: "Volatility",
    kitchen: "How wild the heat swings",
    cooking: "A flame that jumps high and low is hard to cook on. Calm heat is easier to control.",
    slang: "Volatility = how much the price bounces around. Spicy = scary.",
    levels: {
      five: "How much something jumps up and down. A bouncy ball is very 'volatile'.",
      twelve: "How much a price swings around. Big swings = high volatility = bumpier ride.",
      eighteen: "How much a price moves up and down over time. High volatility means bigger swings — more stress, more risk of bad timing.",
      fortyFive: "Standard deviation of returns (often annualised). A risk proxy, not risk itself — it ignores skew and tail behaviour.",
    },
    related: ["risk", "return"],
  },
  {
    key: "dividend",
    term: "Dividend",
    kitchen: "A taste of the profits",
    cooking: "The restaurant shares a spoonful of tonight's profit with every owner.",
    slang: "Dividend = the company pays you a lil cut of profit just for holding. Icey.",
    levels: {
      five: "The shop gives you a little money sometimes for owning a piece.",
      twelve: "A dividend is a small payment a company gives its shareholders from its profit.",
      eighteen: "A cash payment some companies make to shareholders, often quarterly. Income on top of any price gains.",
      fortyFive: "A distribution of earnings to equity holders; carries signalling and discipline effects. Total return = price + reinvested dividends.",
    },
    related: ["stock", "return"],
  },
  {
    key: "index",
    term: "Index (e.g. JSE Top 40)",
    kitchen: "The night's temperature",
    cooking: "One number that tells you how the whole market feels — like tasting the broth.",
    slang: "Index = the average score of a bunch of companies. JSE Top 40 = SA's big 40.",
    levels: {
      five: "One number for how all the big shops are doing together.",
      twelve: "An index averages many companies into one number. The JSE Top 40 tracks SA's 40 biggest.",
      eighteen: "A basket that tracks a market or a slice of it. Often used as a benchmark to measure yourself against.",
      fortyFive: "A rules-based, usually cap-weighted basket; the default benchmark and a low-cost beta vehicle.",
    },
    related: ["benchmark", "stock", "liquidity"],
  },
  {
    key: "open-price",
    term: "Opening price",
    kitchen: "First taste of the service",
    cooking: "The first price when the market opens. It shows where the day starts, not where the dish finishes.",
    slang: "Open price = where the stock starts the trading day.",
    levels: {
      five: "The first price of the day, like the first bite.",
      twelve: "The opening price is the first traded price when the market starts for the day.",
      eighteen: "The opening price is the market's first print of the session. Compare it with the close to see how the day actually cooked.",
      fortyFive: "The first executable session price, often shaped by overnight news, auctions, order imbalance, and liquidity at the open.",
    },
    related: ["close-price", "price-gap", "volatility"],
  },
  {
    key: "close-price",
    term: "Closing price",
    kitchen: "Final plate of the night",
    cooking: "The last price of the day. Gordon uses it to judge what the market finally accepted.",
    slang: "Close price = where the stock ended the day.",
    levels: {
      five: "The last price before the shop closes.",
      twelve: "The closing price is the final traded price at the end of the market day.",
      eighteen: "The close is the session's final reference point. Trend work usually compares closes because they cut through intraday noise.",
      fortyFive: "The end-of-session reference price, frequently used for return, chart, index, and portfolio valuation calculations.",
    },
    related: ["open-price", "trend", "return"],
  },
  {
    key: "adjusted-price",
    term: "Adjusted price",
    kitchen: "Recipe corrected for servings",
    cooking: "If the company splits shares or pays dividends, Gordon adjusts the history so old prices can be compared fairly.",
    slang: "Adjusted price = cleaned-up price history so the chart does not lie.",
    levels: {
      five: "Fixing the old price so the story is fair.",
      twelve: "Adjusted prices correct old data for events like share splits and dividends.",
      eighteen: "Adjusted prices make long-term charts comparable after corporate actions. Without them, a split can look like a crash when it was not.",
      fortyFive: "A corporate-action-adjusted series for total-return or continuity analysis; required for clean backtests and historical drawdown work.",
    },
    related: ["return", "dividend", "trend"],
  },
  {
    key: "trend",
    term: "Trend analysis",
    kitchen: "Which way the heat is travelling",
    cooking: "One candle is noise. A trend is the direction the heat keeps choosing over many services.",
    slang: "Trend = is it mostly climbing, sliding, or chopping sideways?",
    levels: {
      five: "Is the line mostly going up, down, or staying flat?",
      twelve: "Trend analysis looks at many prices to see the main direction.",
      eighteen: "Trend analysis studies repeated price movement over time. Gordon checks direction, speed, and whether the move is stable or fragile.",
      fortyFive: "A directional regime read across time windows, often using returns, moving averages, volatility, drawdown, and benchmark-relative behaviour.",
    },
    related: ["open-price", "close-price", "volatility", "benchmark"],
  },
  {
    key: "stability",
    term: "Stability",
    kitchen: "A steady simmer",
    cooking: "The heat stays controlled. The stock is not lifeless, but it is not jumping around like a pan on fire.",
    slang: "Stability = calmer moves, fewer wild swings.",
    levels: {
      five: "The price does not jump around too much.",
      twelve: "A stable stock moves more calmly than a wild one, though it can still lose money.",
      eighteen: "Stability means the price path is smoother or range-bound. It is useful, but it is not the same thing as safety.",
      fortyFive: "A lower-variance or range-bound regime; still exposed to gap risk, liquidity shocks, fundamentals, and correlation changes.",
    },
    related: ["trend", "volatility", "risk"],
  },
  {
    key: "market-shock",
    term: "Market shock",
    kitchen: "The power cut during service",
    cooking: "A sudden event changes the whole kitchen mood: results, politics, commodity prices, rates, regulation, or scandal.",
    slang: "Shock = news hit the stock and the price moved hard.",
    levels: {
      five: "Something surprising happens and prices jump.",
      twelve: "A market shock is a sudden event that makes prices rise or fall quickly.",
      eighteen: "A shock is a catalyst that changes expectations fast. Gordon asks what happened, whether it is temporary, and whether price reacted too much.",
      fortyFive: "An exogenous or company-specific catalyst causing repricing through earnings expectations, discount rates, liquidity, positioning, or conduct risk.",
    },
    related: ["news-catalyst", "volatility", "risk", "liquidity"],
  },
  {
    key: "drawdown",
    term: "Drawdown",
    kitchen: "How far the dish fell from its best plate",
    cooking: "The drop from the high point to the low point. It shows how painful the bad stretch got.",
    slang: "Drawdown = how deep the dip got from the top.",
    levels: {
      five: "How far something fell after being high.",
      twelve: "Drawdown measures the drop from a previous high to a later low.",
      eighteen: "Drawdown tells you the worst fall from a peak. It matters because surviving the fall is part of winning.",
      fortyFive: "Peak-to-trough loss over a period; central to path risk, risk-of-ruin, investor behaviour, and mandate suitability.",
    },
    related: ["risk", "bear-market", "position-size"],
  },
  {
    key: "price-gap",
    term: "Price gap",
    kitchen: "The oven jumped temperature overnight",
    cooking: "The stock opens far away from where it closed, usually because new information arrived while the market was shut.",
    slang: "Gap = yesterday ended here, today started somewhere else.",
    levels: {
      five: "The price starts far from where it ended yesterday.",
      twelve: "A price gap happens when a stock opens much higher or lower than its last close.",
      eighteen: "A gap often means overnight news or order pressure changed expectations before normal trading began.",
      fortyFive: "A discontinuity between prior close and next open, typically driven by overnight information, auction imbalance, or liquidity repricing.",
    },
    related: ["open-price", "close-price", "market-shock", "volatility"],
  },
  {
    key: "news-catalyst",
    term: "News catalyst",
    kitchen: "The ingredient that changed the recipe",
    cooking: "The story behind the move. Gordon does not trust a price jump until the reason is named.",
    slang: "Catalyst = the reason the stock moved.",
    levels: {
      five: "The thing that made the price move.",
      twelve: "A catalyst is news or an event that pushes investors to change their mind.",
      eighteen: "A catalyst links price action to a reason: earnings, policy, commodities, currency, leadership, lawsuits, or macro news.",
      fortyFive: "An identifiable information event altering expected cash flows, discount rates, risk premia, liquidity, or market positioning.",
    },
    related: ["market-shock", "trend", "market-conduct"],
  },
  {
    key: "heat-check",
    term: "Gordon heat check",
    kitchen: "Gordon tastes the risk before the table cooks",
    cooking: "A plain-language risk read that connects trend, shock, volatility, and reason. It coaches; it does not tell you what to buy.",
    slang: "Heat check = Gordon saying how spicy the stock is and why.",
    levels: {
      five: "Gordon checks if the dish is too hot.",
      twelve: "A heat check explains how risky a stock looks and what to watch.",
      eighteen: "Gordon's heat check is a coaching note: trend, shock, volatility, reason, and confidence. It is not financial advice.",
      fortyFive: "A mock risk-intelligence summary combining price regime, catalysts, volatility, drawdown, liquidity, and data confidence under paper-only constraints.",
    },
    related: ["risk", "trend", "market-shock", "data-confidence"],
    origin: "MOCK_MVP_PAPER_TRADING_ONLY - educational risk commentary, never a recommendation.",
  },
  {
    key: "data-confidence",
    term: "Data confidence",
    kitchen: "How clean the ingredients are",
    cooking: "Gordon grades whether the data is complete, adjusted, sourced, and recent before trusting the heat check.",
    slang: "Data confidence = how much Gordon trusts the numbers.",
    levels: {
      five: "Checking if the numbers are clean.",
      twelve: "Data confidence tells you whether the information is complete and trustworthy enough to use.",
      eighteen: "A low-confidence read means the data is missing, stale, unadjusted, or weakly sourced. Gordon should say that clearly.",
      fortyFive: "A provenance and quality score covering source licensing, completeness, corporate-action adjustment, timestamping, outliers, and auditability.",
    },
    related: ["paper-trading", "adjusted-price", "market-conduct"],
  },
  {
    key: "bull-market",
    term: "Bull market",
    kitchen: "A hot, busy night",
    cooking: "The restaurant is packed, prices and mood are rising.",
    slang: "Bull = prices going up, vibes are up. Letsss go.",
    levels: {
      five: "When prices keep going up and everyone's happy.",
      twelve: "A bull market is when prices rise for a long stretch.",
      eighteen: "A sustained rise in prices and optimism. Easy to feel like a genius — stay humble.",
      fortyFive: "A secular/cyclical uptrend; watch for late-cycle complacency and beta-chasing.",
    },
    related: ["bear-market", "volatility"],
    origin: "A bull thrusts its horns UP — prices up.",
  },
  {
    key: "bear-market",
    term: "Bear market",
    kitchen: "A cold, quiet night",
    cooking: "Empty tables, prices and mood falling.",
    slang: "Bear = prices falling, vibes down. Das cold.",
    levels: {
      five: "When prices keep going down and people are worried.",
      twelve: "A bear market is when prices fall a lot over time.",
      eighteen: "A sustained fall in prices and confidence. Where discipline and survivability earn their keep.",
      fortyFive: "A drawdown regime; correlations drift toward 1 and liquidity thins. Sizing set in calm protects you here.",
    },
    related: ["bull-market", "risk"],
    origin: "A bear swipes its paws DOWN — prices down.",
  },
  {
    key: "liquidity",
    term: "Liquidity",
    kitchen: "How fast you can plate it",
    cooking: "Can you sell the dish quickly without dropping the price? That's liquidity.",
    slang: "Liquid = easy to buy/sell fast. Illiquid = stuck, hard to offload.",
    levels: {
      five: "How easy it is to swap something for money quickly.",
      twelve: "How easily you can sell something without lowering the price much.",
      eighteen: "How quickly you can turn a holding into cash near its fair price. Thin liquidity means nasty surprises.",
      fortyFive: "Market depth and immediacy: the bid-ask + impact cost of exiting size. Liquidity risk compounds violently in stress.",
    },
    related: ["volatility", "index"],
  },
  {
    key: "position-size",
    term: "Position size",
    kitchen: "How much on one plate",
    cooking: "How much of the pot goes on a single dish. Too much, and one mistake ruins the whole night.",
    slang: "Position size = how big your bet is. Keep it survivable, no cap.",
    levels: {
      five: "How big a piece you put on one plate.",
      twelve: "How much of your money goes into one investment. Smaller bets are safer.",
      eighteen: "How much of your capital sits in one position. The #1 lever for not blowing up — bigger than being right.",
      fortyFive: "Fraction of capital at risk per position; governs drawdown and risk-of-ruin, and often dominates long-run outcomes.",
    },
    related: ["risk", "diversification", "hedge"],
  },
  {
    key: "hedge",
    term: "Hedge",
    kitchen: "A backup dish",
    cooking: "A second dish that does well exactly when your main dish struggles — insurance.",
    slang: "Hedge = a side bet that pays if the main thing flops. Safety net.",
    levels: {
      five: "A backup plan in case the first thing goes wrong.",
      twelve: "Something you add that wins when your main bet loses, to soften the blow.",
      eighteen: "A position taken to offset risk in another. Costs a little; saves you in the bad case.",
      fortyFive: "An offsetting exposure to reduce specific risk (delta, FX, rates). Hedging trades expected return for lower variance/tail.",
    },
    related: ["risk", "position-size", "diversification"],
  },
  {
    key: "asset-allocation",
    term: "Asset allocation",
    kitchen: "The recipe ratios",
    cooking: "How much of each ingredient — protein, veg, starch. The ratio makes the dish, not one item.",
    slang: "Allocation = how you split your money across types of stuff. The mix is everything.",
    levels: {
      five: "How you split your things into groups.",
      twelve: "Deciding how much goes into each type of investment (shares, cash, and so on).",
      eighteen: "Splitting capital across asset types. This mix drives most of your long-run risk and return — more than stock-picking.",
      fortyFive: "The strategic split across asset classes; empirically the dominant determinant of portfolio variance over time.",
    },
    related: ["portfolio", "diversification", "risk"],
  },
  {
    key: "correlation",
    term: "Correlation",
    kitchen: "Do they swing together?",
    cooking: "Two dishes that always burn together don't protect you. You want ones that don't.",
    slang: "Correlation = do they move together or not? Same-same = risky.",
    levels: {
      five: "Do two things go up and down at the same time?",
      twelve: "Whether two investments move the same way. If they always move together, they don't protect each other.",
      eighteen: "How much two things move together (from −1 to +1). Diversification needs low or negative correlation to actually work.",
      fortyFive: "Normalised covariance; unstable and regime-dependent — correlations spike toward 1 precisely in crises.",
    },
    related: ["diversification", "portfolio"],
  },
  {
    key: "compounding",
    term: "Compounding",
    kitchen: "Flavour building on flavour",
    cooking: "Yesterday's stock becomes today's base. Gains start earning their own gains.",
    slang: "Compounding = your gains start making their own gains. Snowball. Magnifico.",
    levels: {
      five: "Your money makes a little money, then that makes more too.",
      twelve: "When your profit earns its own profit, growing faster over time.",
      eighteen: "Earning returns on your past returns. Small, steady, repeated = huge over years. Time is the cheat code.",
      fortyFive: "Geometric growth; the gap between arithmetic and geometric mean is where volatility quietly taxes you.",
    },
    related: ["return", "mutual-kitchen"],
  },
  {
    key: "inflation",
    term: "Inflation",
    kitchen: "Ingredients getting pricier",
    cooking: "Same shopping list, bigger bill next year. Your money buys less.",
    slang: "Inflation = stuff gets more expensive, your cash buys less. Eish.",
    levels: {
      five: "When things cost more money than before.",
      twelve: "When prices slowly rise, so the same R100 buys less than last year.",
      eighteen: "The general rise in prices over time. Cash quietly loses buying power — the main reason people invest at all.",
      fortyFive: "Erosion of purchasing power (CPI). The hurdle real returns must clear; the silent benchmark behind every nominal number.",
    },
    related: ["return", "compounding"],
  },
  {
    key: "consensus-60",
    term: "Consensus / The 60% Rule",
    kitchen: "The table agrees",
    cooking: "Nothing cooks until 60% of the table says it's ready. We decide together.",
    slang: "60% Rule = a solid majority (60%) has to agree before we move. No solo cowboys.",
    levels: {
      five: "Most of the group has to say yes before we do it.",
      twelve: "At least 60 out of every 100 votes must say yes before the Kitchen acts.",
      eighteen: "A governance threshold: ≥60% of voters must agree before a trade happens. Stops one loud person running the show.",
      fortyFive: "A supermajority decision rule set above simple majority to damp idiosyncratic, over-confident proposals.",
    },
    related: ["quorum", "behavioural-bias", "mutual-kitchen"],
  },
  {
    key: "quorum",
    term: "Quorum",
    kitchen: "Enough chefs at the table",
    cooking: "You can't decide on the dish if half the kitchen is missing.",
    slang: "Quorum = enough people showed up for the vote to count.",
    levels: {
      five: "Enough friends are here to decide together.",
      twelve: "The smallest number of members needed for a vote to count.",
      eighteen: "The minimum attendance for a decision to be valid. Stops 2 people deciding for 20.",
      fortyFive: "Minimum participation validating a vote; guards against unrepresentative quorum-capture.",
    },
    related: ["consensus-60"],
  },
  {
    key: "behavioural-bias",
    term: "Behavioural bias",
    kitchen: "The ego in the kitchen",
    cooking: "A chef on a hot streak starts believing they can't burn anything — then they do.",
    slang: "Bias = your brain tricking you into a dumb move. Happens to everyone, fr.",
    levels: {
      five: "When your feelings trick you into a silly choice.",
      twelve: "A thinking trap that makes even smart people make bad money choices.",
      eighteen: "A predictable mental shortcut that distorts decisions — overconfidence, loss aversion, herding. Naming it is the defence.",
      fortyFive: "Systematic deviations from rational choice (Kahneman & Tversky). Process and rules exist to neutralise them.",
    },
    related: ["anchoring", "herding", "consensus-60"],
  },
  {
    key: "anchoring",
    term: "Anchoring",
    kitchen: "Stuck on the old price",
    cooking: "Refusing to bin a burnt dish because of how long you spent on it.",
    slang: "Anchoring = clinging to a number (like what you paid). Let it go.",
    levels: {
      five: "Holding onto the first number you heard, even when it's wrong now.",
      twelve: "Letting an old number (like the price you paid) decide what you do now.",
      eighteen: "Over-weighting an irrelevant reference (your buy price). Ask: would I buy this today, at today's price?",
      fortyFive: "Reference-dependence; the sunk-cost and disposition effects flowing from an arbitrary anchor.",
    },
    related: ["behavioural-bias"],
  },
  {
    key: "herding",
    term: "Herding",
    kitchen: "Everyone copying the head chef",
    cooking: "Five chefs agreeing instantly might just be agreeing with each other, not with the food.",
    slang: "Herding = doing it 'cause everyone's doing it. Mid move.",
    levels: {
      five: "Doing something just because everyone else is.",
      twelve: "Following the crowd instead of thinking for yourself.",
      eighteen: "Copying the group and mistaking agreement for being right. A fast, unanimous vote is a red flag.",
      fortyFive: "Information cascades and reflexivity; crowding raises fragility and correlated-unwind risk.",
    },
    related: ["behavioural-bias", "consensus-60"],
  },
  {
    key: "insider-trading",
    term: "Insider trading",
    kitchen: "Peeking at tomorrow's menu",
    cooking: "Using a secret no one else has to win. It poisons the whole kitchen's trust.",
    slang: "Insider trading = trading on secret info. Illegal. Hard no.",
    levels: {
      five: "Cheating by using a secret no one else is allowed to know.",
      twelve: "Trading with secret company info the public doesn't have. It's illegal and unfair.",
      eighteen: "Trading on important information that isn't public yet. Illegal, and it breaks the fairness markets run on.",
      fortyFive: "Trading on material non-public information in breach of duty; a conduct and legal red line regardless of any 'edge'.",
    },
    related: ["market-conduct"],
  },
  {
    key: "market-conduct",
    term: "Market conduct & ethics",
    kitchen: "A clean kitchen",
    cooking: "A dirty kitchen poisons someone eventually. Clean habits protect everyone.",
    slang: "Market conduct = play fair. Clean kitchen, clean conscience.",
    levels: {
      five: "Playing fair so no one gets hurt.",
      twelve: "The rules that keep trading fair and honest for everyone.",
      eighteen: "The standards that keep markets fair — no manipulation, no insider edge. Build the habit now, in practice.",
      fortyFive: "The conduct framework (fairness, disclosure, best execution) underpinning market integrity and trust.",
    },
    related: ["insider-trading"],
  },
  {
    key: "benchmark",
    term: "Benchmark (here: Gordon)",
    kitchen: "Gordon's plate",
    cooking: "The score to beat. Gordon cooks a dish each week — can you beat his return?",
    slang: "Benchmark = the score you measure against. Here it's Gordon.",
    levels: {
      five: "The score you're trying to beat.",
      twelve: "A standard to compare against. Beating it means you did better than the benchmark.",
      eighteen: "A reference to judge your performance. Beating an index (or Gordon) is the real test — not just a positive number.",
      fortyFive: "The risk-appropriate comparator for alpha attribution; out-performing it on a risk-adjusted basis is what counts.",
    },
    related: ["index", "return"],
  },
  {
    key: "paper-trading",
    term: "Paper trading",
    kitchen: "The practice kitchen",
    cooking: "Real recipes, real scoreboard — but no real money on the line. Practice until it's instinct.",
    slang: "Paper trading = practice mode. Fake money, real lessons. No risk, all reps.",
    levels: {
      five: "Pretend money to practise, so mistakes don't hurt.",
      twelve: "Practising investing with fake money so you learn without losing anything real.",
      eighteen: "Simulated investing with virtual capital. You build skill and habits before real money is ever involved.",
      fortyFive: "A simulation environment for strategy and behaviour rehearsal; the entire Young Investors MVP is paper-only.",
    },
    related: ["portfolio", "benchmark"],
    origin: "This whole app is MOCK_MVP_PAPER_TRADING_ONLY — practice, never real money.",
  },
  {
    key: "mutual-kitchen",
    term: "Mutual Kitchen",
    kitchen: "The slow cook",
    cooking: "Low heat, long time, flavours build. Everyone has an equal say. Patient wins.",
    slang: "Mutual Kitchen = slow cook, long game, one chef one vote.",
    levels: {
      five: "A team that cooks slowly and carefully together, everyone equal.",
      twelve: "A group that invests patiently for the long term, where everyone's vote is equal.",
      eighteen: "The slow-cook model: long holds, broad diversification, equal voting. Discipline and patience compound.",
      fortyFive: "An equal-governance, long-horizon mandate favouring diversification and process over tactical agility.",
    },
    related: ["consensus-60", "compounding", "hedge-kitchen"],
  },
  {
    key: "hedge-kitchen",
    term: "Hedge Kitchen",
    kitchen: "The high heat",
    cooking: "Sear fast, pull it before it burns. Better reward, real risk, strict exit rules.",
    slang: "Hedge Kitchen = high heat, sharper bets, hard stop-losses. Not for rookies.",
    levels: {
      five: "A team that cooks fast on high heat — exciting, but you must be careful.",
      twelve: "A group using bolder, shorter bets with strict rules to cut losses fast.",
      eighteen: "The high-heat model: asymmetric bets, shorter holds, non-negotiable exit thresholds. Needs skill and discipline.",
      fortyFive: "A tactical mandate using directional/relative-value positions with hard risk limits and mandatory stop discipline.",
    },
    related: ["hedge", "position-size", "mutual-kitchen"],
  },
];

export const GLOSSARY: Record<string, GlossaryEntry> = Object.fromEntries(
  GLOSSARY_LIST.map((e) => [e.key, e])
);

export function getEntry(key: string): GlossaryEntry | undefined {
  return GLOSSARY[key];
}

function uniqueKeys(keys: string[]): string[] {
  return Array.from(new Set(keys));
}

export function glossaryForKeys(keys: string[]): GlossaryEntry[] {
  return uniqueKeys(keys)
    .map((key) => GLOSSARY[key])
    .filter((entry): entry is GlossaryEntry => Boolean(entry));
}

export const HEAT_CHECK_GLOSSARY_KEYS: Record<GordonHeatCheckConcept, string[]> = {
  "selected-stock": ["stock", "portfolio", "position-size", "risk"],
  "top-40-index": ["index", "benchmark", "liquidity"],
  "opening-price": ["open-price", "price-gap", "volatility"],
  "closing-price": ["close-price", "return", "trend"],
  "adjusted-price": ["adjusted-price", "dividend", "return"],
  "trend-analysis": ["trend", "bull-market", "bear-market", "benchmark"],
  "market-shock": ["market-shock", "news-catalyst", "risk", "liquidity"],
  stability: ["stability", "volatility", "risk"],
  drawdown: ["drawdown", "bear-market", "position-size"],
  "price-gap": ["price-gap", "open-price", "close-price", "market-shock"],
  "heat-check": ["heat-check", "risk", "trend", "data-confidence"],
  "news-context": ["news-catalyst", "market-shock", "market-conduct"],
  "data-confidence": ["data-confidence", "adjusted-price", "market-conduct"],
};

export function glossaryKeysForHeatCheck(concepts: GordonHeatCheckConcept[]): string[] {
  return uniqueKeys(concepts.flatMap((concept) => HEAT_CHECK_GLOSSARY_KEYS[concept]));
}

export function glossaryForHeatCheck(concepts: GordonHeatCheckConcept[]): GlossaryEntry[] {
  return glossaryForKeys(glossaryKeysForHeatCheck(concepts));
}

export const SHOP_STOCK_HEAT_CHECK_CONCEPTS: GordonHeatCheckConcept[] = [
  "selected-stock",
  "top-40-index",
  "opening-price",
  "closing-price",
  "adjusted-price",
  "trend-analysis",
  "market-shock",
  "stability",
  "drawdown",
  "price-gap",
  "heat-check",
  "news-context",
  "data-confidence",
];

export const SHOP_STOCK_HEAT_CHECK_GLOSSARY = glossaryForHeatCheck(SHOP_STOCK_HEAT_CHECK_CONCEPTS);

/** Which glossary terms each Academy cooking class checks before it begins. */
export const MODULE_GLOSSARY: Record<string, string[]> = {
  "markets-001": ["stock", "index", "bull-market", "bear-market"],
  "risk-001": ["risk", "return", "position-size", "volatility"],
  "portfolio-001": ["portfolio", "diversification", "asset-allocation", "correlation"],
  "bias-001": ["behavioural-bias", "anchoring", "herding"],
  "governance-001": ["consensus-60", "quorum"],
  "mutual-001": ["mutual-kitchen", "compounding", "dividend"],
  "hedge-001": ["hedge-kitchen", "hedge", "position-size"],
  "ethics-001": ["market-conduct", "insider-trading"],
};

export function glossaryForModule(moduleId: string): GlossaryEntry[] {
  return glossaryForKeys(MODULE_GLOSSARY[moduleId] ?? []);
}

/**
 * Reader levels expressed as CHEF RANK, not age (we're not ageist — everyone's a
 * chef here, just at different stations). Junior is the simplest explanation, Master
 * is the precise pro version. "five" stays in the data as a future "explain like I'm
 * new" / Ask-Gordon level.
 */
export const READER_LEVELS: { key: keyof GlossaryLevels; label: string }[] = [
  { key: "twelve", label: "Junior Chef" },
  { key: "eighteen", label: "Intermediate" },
  { key: "fortyFive", label: "Master Chef" },
];
