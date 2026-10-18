/*
 * Case-study content. Every number below comes from the project's own repo
 * (README, evaluation reports and training_metrics_report.json).
 */
export const PROJECTS = {
  trader: {
    title: 'AI Stock Trader',
    category: 'Machine Learning · FinTech',
    lead:
      'A paper-trading system for 25 US stocks where a risk engine can veto any trade and every backtest is shown next to SPY. It trails the index, and the repo says so.',
    github: 'https://github.com/praneeth-hari/ai-stock-trader',
    cover: 'projects/ai-stock-trader.png',
    shot: {
      src: 'projects/ai-stock-trader-dashboard.webp',
      alt: 'The AI Stock Trader operator dashboard showing portfolio value, cash, active positions and system status',
      caption: 'The Streamlit operator dashboard on simulated money: portfolio value, cash, open positions and system status, with eleven tabs behind it (trades, model and regime, backtest vs SPY, risk and audit logs). Snapshot from 15 October 2026.',
    },
    stack: [
      'Python', 'scikit-learn', 'pandas', 'SQLAlchemy', 'SQLite', 'Streamlit', 'pytest',
      'GitHub Actions', 'Telegram alerts'
    ],
    stats: [
      { value: '25', label: 'US stocks tracked', note: 'SPY as the benchmark' },
      { value: '701', label: 'automated tests passing', note: 'pytest, 0 failures' },
      { value: '0.2%', label: 'simulated cost on every trade', note: 'only net returns reported' },
      { value: '12 mo', label: 'forward paper trading before a verdict', note: 'decided in advance' }
    ],
    problem:
      'A backtest curve that only goes up is easy to build and easy to be fooled by. I wanted a trading system that tries hard not to flatter itself: no look-ahead, costs always applied, every result shown beside SPY buy-and-hold, and a goal of “do not lose money” instead of “beat the market”. Then I froze it on 26 September 2026 and let forward paper trading judge it.',
    rows: [
      {
        title: '1 · Decide',
        nodes: [
          {
            id: 'data', label: 'Market data', sub: 'Validation gate',
            what: 'Pulls daily US price history and saves the raw pull unmodified. A validation gate rejects impossible values and flags ±50% spikes and gaps. A bad ticker is skipped and logged, never patched with made-up data.',
            facts: ['25 US tickers plus SPY', 'Raw data is kept untouched', 'No filled-in fake values'],
            files: ['src/data/market_data.py', 'src/data/validation.py']
          },
          {
            id: 'features', label: 'Features', sub: '15 inputs',
            what: 'Turns prices into 15 numbers the model can use: distance from the 20, 50 and 200-day averages, momentum, RSI, MACD, volatility, volume spikes and strength relative to the market.',
            facts: ['price_to_ma20 / 50 / 200, roc_5, roc_21', 'rsi_14, macd line / signal / hist', 'vol_20, atr_14, vol_ratio_5_20, vol_spike, rel_strength_21'],
            files: ['src/features/engineer.py']
          },
          {
            id: 'model', label: 'Logistic regression', sub: 'Chance of +1% in 5 days',
            what: 'Predicts the probability that a stock rises more than 1% over the next 5 trading days. The active model is logistic_regression_baseline_v1, trained on 2019-12-13 to 2023-12-01 with a 5-day purge gap between training and test data.',
            facts: ['StandardScaler + logistic regression', 'class_weight balanced, seed 42', '2,997 training rows · 531 test rows', 'Held-out test ROC-AUC 0.53 (0.50 is a coin flip)'],
            files: ['src/ml/train.py', 'src/ml/evaluate.py']
          },
          {
            id: 'entry', label: 'Entry rules', sub: 'Probability ≥ 0.60',
            what: 'The model’s probability is nudged by sector rotation (+0.04 for the top 2 sectors, −0.04 for the bottom 3) and news sentiment (+0.03 or −0.05, with a veto below −0.6). A stock is bought at 0.60 or higher. No new buys while SPY is under its 200-day average, and none just before earnings.',
            facts: ['Buy bar rises by 0.03 in a restrictive macro regime', 'Half size 3 to 5 days before earnings', 'Long-only'],
            files: ['src/ranking/ranking.py', 'src/intelligence/sentiment.py', 'src/intelligence/sector_rotation.py']
          }
        ]
      },
      {
        title: '2 · Protect and measure',
        nodes: [
          {
            id: 'risk', label: 'Risk engine', sub: 'Can veto any trade',
            what: 'Sits between the model and the broker. The model never trades directly: every order passes through the risk engine, which can cut the size or refuse it.',
            why: 'The system’s goal is capital preservation, so the part that can say “no” has the final word. When in doubt it stays in cash.',
            facts: ['3 positions, about 15% cash reserve', 'Stop-loss −8%, take-profit +15%', 'Blocks highly correlated pairs (above 0.85 in the same sector)', 'Circuit breaker: a 7% SPY drop in 5 days pauses trading for 5 days'],
            files: ['src/risk/risk_engine.py', 'src/risk/correlation.py']
          },
          {
            id: 'broker', label: 'Paper broker', sub: 'Next-open fills',
            what: 'Simulates trades with $10,000 of paper money. The decision is made on the prior close and filled at the next open, with a 0.2% cost on every trade.',
            why: 'Deciding on one price and filling at an earlier one is the quietest way to fake a backtest, so the code makes that impossible.',
            facts: ['No broker integration, simulated money only', 'Fractional shares allowed', '$10 minimum trade'],
            files: ['src/trading/paper_broker.py']
          },
          {
            id: 'backtest', label: 'Walk-forward backtest', sub: 'Always beside SPY',
            what: 'Re-trains a new model every 6 months and tests it on the period after, so it only ever predicts data it has not seen. Every run is shown next to SPY buy-and-hold, and a known-answer test checks that “buy SPY and hold” reproduces SPY’s real return.',
            why: 'A suspiciously good result is treated as a bug to investigate, not a win to publish.',
            facts: ['2-year walk-forward windows', 'Only net-of-cost returns reported', 'Two periods: 2007–2016 and 2017–2026'],
            files: ['src/backtest/backtest.py']
          },
          {
            id: 'report', label: 'Dashboard and alerts', sub: 'Streamlit · Telegram',
            what: 'A Streamlit dashboard shows the portfolio, the decision log and a SPY 200-day shadow benchmark that runs alongside the strategy. Weekly summaries and Telegram and email alerts report what happened and why.',
            facts: ['Every decision is logged with its reason', 'SPY 200-day timing as a second benchmark', 'Run status: SUCCESS, SKIPPED, DEGRADED, FAILED or HALTED'],
            files: ['dashboard/app.py', 'src/reports/decision_log.py', 'src/trading/shadow_benchmark.py']
          }
        ]
      }
    ],
    challenge: {
      title: 'It trailed the index, and I kept the result',
      text:
        'After tuning, no configuration showed a durable edge over SPY, so I stopped tuning and froze V1. In the 2-year walk-forward tests the strategy earned 1.09% a year over 2007–2016 and 1.26% over 2017–2026, against 4.66% and 13.40% for buying and holding SPY. Its worst drawdowns were smaller than SPY’s in both periods, but the return gap is large. I would rather publish that than tune until the chart looks good.',
      unit: '%', max: 15,
      series: [
        { label: 'Frozen strategy', key: 'strategy', tone: 'is-clean' },
        { label: 'SPY buy and hold', key: 'spy', tone: 'is-swap' }
      ],
      bars: [
        { name: 'Yearly return, 2007–2016', strategy: 1.09, spy: 4.66 },
        { name: 'Yearly return, 2017–2026', strategy: 1.26, spy: 13.4 }
      ]
    },
    rag: {
      eyebrow: 'The honest scorecard',
      title: 'What the numbers say, 2017–2026',
      text:
        'Net of the 0.2% trading cost and optimistic by design: real results are likely worse. The point is the gap, and one stock that explains a lot of it.',
      stats: [
        { value: '0.19', label: 'Sharpe ratio of the strategy', note: 'SPY buy and hold: 0.78' },
        { value: '−31.4%', label: 'worst drawdown of the strategy', note: 'SPY buy and hold: −34.1%' },
        { value: '1 in 3', label: 'trades were TSLA', note: '32–35% of all trades, one stock' },
        { value: '−$703', label: 'profit and loss without TSLA', note: 'a loss in both test periods' }
      ]
    },
    decisions: [
      {
        title: 'Freezing the model before forward trading',
        text: 'Once tuning stopped, the model file was locked by its sha256 hash. The daily run refuses to trade if the file is missing or different, and it can never train and promote a replacement on its own. Monthly retraining still runs, but its candidates only wait for my approval.'
      },
      {
        title: 'Deciding the verdict in advance',
        text: 'Before any forward results existed I wrote what to measure and when to judge: after 12 months, if the strategy does not beat SPY-with-a-200-day-filter on both Sharpe and drawdown, the machine-learning layer adds no value in V1. A sector idea had already failed its own test (it passed 2 of 4 windows and needed 3), so it was dropped instead of reworded.'
      },
      {
        title: 'All-or-nothing trading days',
        text: 'A day’s fills, cash, positions and pending orders are saved together in one commit. If a run stops halfway, the next run clears its partial rows, keeps a copy in the audit log and executes the committed orders exactly once. An operating-system file lock stops two runs at the same time.'
      },
      {
        title: 'Saying what was never tested',
        text: 'Sentiment and the earnings calendar only exist live and were never backtested. The PSI drift check is not active in V1. The frozen model was trained on 2019–2023 data, so it cannot be backtested honestly over those years: forward trading is its first real test. The freeze report lists all of this.'
      }
    ],
    limits: [
      'Simulated money only, with no broker connection. Real-money trading is out of scope until a written checklist is met.',
      'The frozen strategy trails SPY buy-and-hold in historical tests. Forward trading exists to measure it, not to prove it works.',
      'Without TSLA the strategy lost money in both test periods, so the result leans on one stock.',
      'Backtests are optimistic, and 12 months of forward trading is still a small sample.',
      'It runs on one Windows machine through Task Scheduler. The GitHub Actions trading job is switched off.'
    ]
  },

  mediplant: {
    title: 'Medicinal Plant Detection',
    category: 'Computer Vision + RAG',
    lead:
      'Take a photo of a leaf and the app names the plant in under 10 ms. Then ask it anything about that plant and a local assistant answers from verified monographs, with a source for every claim.',
    github: 'https://github.com/praneeth-hari/Medicinal-Plant-Detection',
    demo: 'https://ai-medicinal-plant-identification.vercel.app/',
    cover: 'projects/medicinal-plant.png',
    video: {
      src: 'projects/medicinal-plant-demo.mp4',
      poster: 'projects/medicinal-plant-demo-poster.jpg',
      caption: 'One minute, start to finish: upload a leaf photo, get the species with a confidence score, then ask the cited RAG assistant about its uses.',
    },
    stack: [
      'Python', 'PyTorch', 'MobileNetV3', 'FastAPI', 'SQLite', 'SQLAlchemy', 'sentence-transformers',
      'FAISS', 'Ollama', 'Qwen 2.5 3B', 'React', 'Vite', 'Tailwind CSS'
    ],
    stats: [
      { value: '78', label: 'plant species recognised' },
      { value: '9.09 ms', label: 'average prediction time per photo' },
      { value: '86.7%', label: 'test accuracy on normal photos', note: '1,101 test images' },
      { value: '78.9%', label: 'test accuracy with backgrounds swapped', note: 'same test images' }
    ],
    problem:
      'Plants look alike and the internet is full of confident, unsourced herbal advice. I wanted a tool that identifies a leaf quickly, then answers questions only from reviewed sources, says so when it does not know, and keeps health questions on the user’s own machine.',
    rows: [
      {
        title: '1 · Recognise the plant',
        nodes: [
          {
            id: 'photo', label: 'Leaf photo', sub: 'Upload · webcam · samples',
            what: 'A visitor drops in a photo, opens the webcam or taps a sample leaf. The browser checks the format and size before anything is sent.',
            facts: ['JPG / PNG only', '5 MB limit in the browser'],
            files: ['frontend/src/pages/PlantDetection.jsx']
          },
          {
            id: 'react', label: 'React app', sub: 'Vite · Tailwind · Axios',
            what: 'Sends the image to the API and shows the best match with a confidence percentage. Below 70% it shows an amber warning asking for a clearer, closer photo of a single leaf.',
            facts: ['React 18 + Vite 6', 'Tailwind CSS + Framer Motion', 'Low-confidence warning under 70%'],
            files: ['frontend/src/pages/PlantDetection.jsx', 'frontend/src/api/client.js']
          },
          {
            id: 'api', label: 'FastAPI', sub: 'POST /api/v1/detect',
            what: 'Receives the upload, enforces a 10 MB limit, saves it under a random file name and calls the model. Each result is stored so the detection history can be shown later.',
            facts: ['Endpoints → services → repositories → database', '10 MB server limit', 'Random UUID file names'],
            files: ['backend/api/v1/endpoints/detection.py', 'backend/services/detection_service.py']
          },
          {
            id: 'cnn', label: 'MobileNetV3-Small', sub: '78 species · 9.09 ms',
            what: 'A PyTorch image classifier fine-tuned on the Indian Medicinal Leaves dataset (6,884 images, 78 classes). At prediction time it looks at 2 to 5 crops of the photo (the whole leaf plus zoomed regions) and averages their predictions.',
            why: 'It is fast and lightweight, so it answers in under 10 ms without needing an expensive GPU.',
            facts: ['New head: 576 → 1024 → 78', '224 × 224 input, top-5 predictions returned', '9.09 ms average, one image at a time, on GPU'],
            files: ['ml/model.py', 'ml/predict.py', 'ml/train.py']
          },
          {
            id: 'db', label: 'SQLite', sub: 'Monographs · history',
            what: 'Turns the model’s label into a plant record. A class_label column links model outputs to verified monographs, so a label that has no reviewed write-up shows "Monograph unavailable" instead of a guess.',
            why: 'Local and zero-setup: there is no database server to run.',
            facts: ['Async SQLAlchemy + aiosqlite', '23 plant monographs', 'Alembic migrations'],
            files: ['backend/models/', 'backend/repositories/']
          }
        ]
      },
      {
        title: '2 · Ask about it',
        nodes: [
          {
            id: 'ask', label: 'Question', sub: 'From the plant card or chat',
            what: 'The user taps a question on the detection card or types one in the assistant. It is sent to POST /api/v1/chat together with the conversation.',
            facts: ['Multi-turn chat sessions', 'Saved in SQLite'],
            files: ['frontend/src/pages/RAGAssistant.jsx', 'frontend/src/api/chat.js']
          },
          {
            id: 'guard', label: 'Guardrails', sub: 'AI Control Tower',
            what: 'Before retrieval the message is scanned for harmful intent (blocked with a clear message) and personal data such as emails, phone numbers and patient IDs is masked. Every request is logged with its latency and status.',
            why: 'Built in as a small governance layer, so no outside monitoring service is needed.',
            facts: ['Toxic queries are blocked', 'Personal data is masked', 'Audit log of the last 100 requests', 'Dosage questions get a medical disclaimer'],
            files: ['backend/services/chat_service.py', 'backend/services/metrics.py']
          },
          {
            id: 'embed', label: 'MiniLM embeddings', sub: '384 dimensions',
            what: 'Turns the question and the plant text chunks into vectors, so text with similar meaning ends up close together.',
            why: 'A fast, lightweight embedding model.',
            facts: ['all-MiniLM-L6-v2', 'Chunks of 500 characters, 50 overlap', 'Reviewed monographs are split by section'],
            files: ['backend/rag/embeddings.py']
          },
          {
            id: 'faiss', label: 'FAISS index', sub: '77 chunks · 23 plants',
            what: 'Stores the vectors on disk and finds the closest chunks by cosine similarity.',
            why: 'It needs no server process. I removed ChromaDB and LangChain in favour of plain faiss-cpu to avoid dependency conflicts and keep everything self-contained.',
            facts: ['IndexFlatIP on normalised vectors', 'Chunk tags: uses, preparation, safety, misconceptions'],
            files: ['backend/rag/vector_store.py']
          },
          {
            id: 'retriever', label: 'Retriever', sub: 'Re-ranks · top 5',
            what: 'Fetches extra candidates, boosts chunks about the plant named in the question (+0.25), penalises off-target ones (−0.10) and keeps the best five. Plant names come from the index itself and match whole words only.',
            why: 'Plain vector search sometimes ranked another plant’s chunk above the right one. This re-ranking fixed it (see decisions below).',
            facts: ['top_k = 5, searches max(2×k, 10)', 'Up to top_k chunks per plant', 'Whole-word matching: "pea" does not match "appear"'],
            files: ['backend/rag/retriever.py']
          },
          {
            id: 'llm', label: 'Qwen 2.5 (3B)', sub: 'Local · via Ollama',
            what: 'Writes the answer using only the retrieved chunks, with a [Source N] marker on every claim. Seven prompt rules: no outside knowledge, say what is missing, always surface safety warnings, and never present a misconception as a benefit.',
            why: 'It runs on the user’s own computer, so health questions are never sent to an outside API. It is free, private and works offline.',
            facts: ['Temperature 0.3, up to 512 tokens', 'A fixed refusal sentence when nothing relevant is found'],
            files: ['backend/rag/generator.py', 'backend/rag/pipeline.py']
          },
          {
            id: 'answer', label: 'Cited answer', sub: 'Source pills',
            what: 'The reply shows tappable source pills with a relevance percentage and an expandable snippet, and links to the plant’s full monograph.',
            facts: ['Citations parsed from [Source N]', 'Snippets of 200 characters'],
            files: ['frontend/src/pages/RAGAssistant.jsx']
          }
        ]
      }
    ],
    challenge: {
      title: 'The score I trust is the lower one',
      text:
        'My first model scored 93.9% on the test set. Then I swapped the photo backgrounds and it fell to 43.5%. It had learned the background (neem leaves on stone floors, curry leaves on white paper), not the leaf. I wrote a BackgroundSwap augmentation that cuts the leaf out by colour and pastes it onto varied backgrounds, then retrained. The final model scores less on the original photos but holds up when the background changes.',
      bars: [
        { name: 'First model', clean: 93.9, swapped: 43.5 },
        { name: 'Final model', clean: 86.7, swapped: 78.9 }
      ]
    },
    rag: {
      title: 'Measuring the retrieval',
      text:
        'I wrote an evaluation set of 89 questions and track whether the right chunks come back, so changes to the retriever are measured instead of guessed.',
      stats: [
        { value: '100%', label: 'right plant ranked first', note: '89 questions' },
        { value: '100%', label: 'right plant and topic in the top 3', note: '89 questions' },
        { value: '77.5%', label: 'exact answer chunk ranked first', note: '49 reviewed questions' },
        { value: '98%', label: 'exact answer chunk in the top 3', note: '49 reviewed questions' }
      ]
    },
    decisions: [
      {
        title: 'Fixing chunks pushed out by other plants',
        text: 'A hard cap of 2 chunks per plant made sense for short entries. Once monographs had 14 to 17 section-aligned chunks, the right ones were displaced by other species. Raising the cap to top_k took plant-and-topic hits in the top 3 and 5 from 93.9% and 98.0% to 100%, and cut off-plant chunks from 1.53 to 0.41 per answer.'
      },
      {
        title: 'No hard-coded plant names',
        text: 'The boost used a fixed list of 20 plants, and short names like "Pea" or "Lemon" matched inside other words. The retriever now reads plant names from the index and matches whole words only, so adding a plant needs no code change.'
      },
      {
        title: 'Local first',
        text: 'The first version had login, tokens and a multi-container setup, which got in the way of a personal reference tool. I removed that, moved to SQLite, and switched generation to a local Ollama model so nothing leaves the machine.'
      },
      {
        title: 'Knowing what is not known',
        text: 'The classifier recognises 78 species but only 23 plants have reviewed monographs. Rather than let the assistant improvise, a label with no write-up shows "Monograph unavailable", and the assistant is told to refuse when its sources do not cover the question.'
      }
    ],
    limits: [
      'It is a local, single-user tool without login, not an internet-facing service.',
      'The live assistant needs Ollama running with the model downloaded. The public demo uses precomputed predictions for sample leaves.',
      'Only 23 plants have monographs, even though 78 species can be recognised.'
    ]
  }
};
