/*
 * Case-study content. Every number below comes from the project's own repo
 * (README, evaluation reports and training_metrics_report.json).
 */
export const PROJECTS = {
  trader: {
    title: 'AI Stock Trader',
    category: 'Machine Learning · FinTech',
    lead: 'A paper-trading system for 25 US stocks where a risk engine can veto any trade and every backtest is shown next to SPY. It trails the index, and the repo says so.',
    github: 'https://github.com/praneeth-hari/ai-stock-trader',
    cover: 'projects/ai-stock-trader.webp',
    shot: {
      src: 'projects/ai-stock-trader-dashboard.webp',
      width: 1390,
      height: 690,
      alt: 'The AI Stock Trader operator dashboard showing portfolio value, cash, active positions and system status',
      caption:
        'The Streamlit operator dashboard on simulated money: portfolio value, cash, open positions and system status, with eleven tabs behind it (trades, model and regime, backtest vs SPY, risk and audit logs). Snapshot from 15 October 2026.'
    },
    stack: [
      'Python',
      'scikit-learn',
      'pandas',
      'SQLAlchemy',
      'SQLite',
      'Streamlit',
      'pytest',
      'GitHub Actions',
      'Telegram alerts'
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
            id: 'data',
            label: 'Market data',
            sub: 'Validation gate',
            what: 'Pulls daily US price history and saves the raw pull unmodified. A validation gate rejects impossible values and flags ±50% spikes and gaps. A bad ticker is skipped and logged, never patched with made-up data.',
            facts: ['25 US tickers plus SPY', 'Raw data is kept untouched', 'No filled-in fake values'],
            files: ['src/data/market_data.py', 'src/data/validation.py']
          },
          {
            id: 'features',
            label: 'Features',
            sub: '15 inputs',
            what: 'Turns prices into 15 numbers the model can use: distance from the 20, 50 and 200-day averages, momentum, RSI, MACD, volatility, volume spikes and strength relative to the market.',
            facts: [
              'price_to_ma20 / 50 / 200, roc_5, roc_21',
              'rsi_14, macd line / signal / hist',
              'vol_20, atr_14, vol_ratio_5_20, vol_spike, rel_strength_21'
            ],
            files: ['src/features/engineer.py']
          },
          {
            id: 'model',
            label: 'Logistic regression',
            sub: 'Chance of +1% in 5 days',
            what: 'Predicts the probability that a stock rises more than 1% over the next 5 trading days. The active model is logistic_regression_baseline_v1, trained on 2019-12-13 to 2023-12-01 with a 5-day purge gap between training and test data.',
            facts: [
              'StandardScaler + logistic regression',
              'class_weight balanced, seed 42',
              '2,997 training rows · 531 test rows',
              'Held-out test ROC-AUC 0.53 (0.50 is a coin flip)'
            ],
            files: ['src/ml/train.py', 'src/ml/evaluate.py']
          },
          {
            id: 'entry',
            label: 'Entry rules',
            sub: 'Probability ≥ 0.60',
            what: 'The model’s probability is nudged by sector rotation (+0.04 for the top 2 sectors, −0.04 for the bottom 3) and news sentiment (+0.03 or −0.05, with a veto below −0.6). A stock is bought at 0.60 or higher. No new buys while SPY is under its 200-day average, and none just before earnings.',
            facts: [
              'Buy bar rises by 0.03 in a restrictive macro regime',
              'Half size 3 to 5 days before earnings',
              'Long-only'
            ],
            files: [
              'src/ranking/ranking.py',
              'src/intelligence/sentiment.py',
              'src/intelligence/sector_rotation.py'
            ]
          }
        ]
      },
      {
        title: '2 · Protect and measure',
        nodes: [
          {
            id: 'risk',
            label: 'Risk engine',
            sub: 'Can veto any trade',
            what: 'Sits between the model and the broker. The model never trades directly: every order passes through the risk engine, which can cut the size or refuse it.',
            why: 'The system’s goal is capital preservation, so the part that can say “no” has the final word. When in doubt it stays in cash.',
            facts: [
              '3 positions, about 15% cash reserve',
              'Stop-loss −8%, take-profit +15%',
              'Blocks highly correlated pairs (above 0.85 in the same sector)',
              'Circuit breaker: a 7% SPY drop in 5 days pauses trading for 5 days'
            ],
            files: ['src/risk/risk_engine.py', 'src/risk/correlation.py']
          },
          {
            id: 'broker',
            label: 'Paper broker',
            sub: 'Next-open fills',
            what: 'Simulates trades with $10,000 of paper money. The decision is made on the prior close and filled at the next open, with a 0.2% cost on every trade.',
            why: 'Deciding on one price and filling at an earlier one is the quietest way to fake a backtest, so the code makes that impossible.',
            facts: [
              'No broker integration, simulated money only',
              'Fractional shares allowed',
              '$10 minimum trade'
            ],
            files: ['src/trading/paper_broker.py']
          },
          {
            id: 'backtest',
            label: 'Walk-forward backtest',
            sub: 'Always beside SPY',
            what: 'Re-trains a new model every 6 months and tests it on the period after, so it only ever predicts data it has not seen. Every run is shown next to SPY buy-and-hold, and a known-answer test checks that “buy SPY and hold” reproduces SPY’s real return.',
            why: 'A suspiciously good result is treated as a bug to investigate, not a win to publish.',
            facts: [
              '2-year walk-forward windows',
              'Only net-of-cost returns reported',
              'Two periods: 2007–2016 and 2017–2026'
            ],
            files: ['src/backtest/backtest.py']
          },
          {
            id: 'report',
            label: 'Dashboard and alerts',
            sub: 'Streamlit · Telegram',
            what: 'A Streamlit dashboard shows the portfolio, the decision log and a SPY 200-day shadow benchmark that runs alongside the strategy. Weekly summaries and Telegram and email alerts report what happened and why.',
            facts: [
              'Every decision is logged with its reason',
              'SPY 200-day timing as a second benchmark',
              'Run status: SUCCESS, SKIPPED, DEGRADED, FAILED or HALTED'
            ],
            files: ['dashboard/app.py', 'src/reports/decision_log.py', 'src/trading/shadow_benchmark.py']
          }
        ]
      }
    ],
    challenge: {
      title: 'It trailed the index, and I kept the result',
      text: 'After tuning, no configuration showed a durable edge over SPY, so I stopped tuning and froze V1. In the 2-year walk-forward tests the strategy earned 1.09% a year over 2007–2016 and 1.26% over 2017–2026, against 4.66% and 13.40% for buying and holding SPY. Its worst drawdowns were smaller than SPY’s in both periods, but the return gap is large. I would rather publish that than tune until the chart looks good.',
      unit: '%',
      max: 15,
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
      text: 'Net of the 0.2% trading cost and optimistic by design: real results are likely worse. The point is the gap, and one stock that explains a lot of it.',
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

  securecloud: {
    title: 'Secure Cloud ML',
    category: 'Machine Learning · Security',
    lead: 'A Flask web app that sorts network traffic into normal or four kinds of attack, running five different models side by side on every upload, with AES-256 encryption on the upload path and a token-protected API.',
    github: 'https://github.com/praneeth-hari/Secure-Cloud-Ml',
    cover: 'projects/secure-cloud-ml.webp',
    shotsTitle: { eyebrow: 'See it work', heading: 'Upload traffic, get five verdicts' },
    shots: [
      {
        src: 'projects/secure-cloud-predict.webp',
        width: 1100,
        height: 665,
        alt: 'Prediction results table where five models classify 11 network traffic samples as normal, dos, r2l or u2r',
        caption:
          'The prediction page after uploading the 11-row sample. Every model labels every row, so you can see where they agree and where they split: on 4 of the 11 rows at least one model disagrees.'
      },
      {
        src: 'projects/secure-cloud-dashboard.webp',
        width: 1100,
        height: 615,
        alt: 'Model performance dashboard with accuracy, F1, precision and recall cards and bar and radar charts for five models',
        caption:
          'The model dashboard: the best scores up top, then bar and radar charts that put all five models on the same axes.'
      }
    ],
    stack: [
      'Python',
      'Flask',
      'scikit-learn',
      'XGBoost',
      'TensorFlow / Keras',
      'pandas',
      'pycryptodome',
      'Flask-JWT-Extended',
      'Chart.js',
      'Docker',
      'Waitress'
    ],
    stats: [
      {
        value: '5',
        label: 'models compared on every upload',
        note: 'KNN · ANN · ANN + ABC · Random Forest · XGBoost'
      },
      { value: '99.99%', label: 'XGBoost accuracy', note: '20% held-out split' },
      {
        value: '125,973',
        label: 'traffic records, 41 features each',
        note: 'NSL-KDD training set, 5 classes'
      },
      { value: '256-bit', label: 'AES encryption on the upload path', note: 'random IV on every message' }
    ],
    problem:
      'In the NSL-KDD intrusion data, 125,973 records include 67,343 normal ones but only 995 R2L attacks and just 52 U2R attacks, so a single accuracy number can look great while the model misses the attacks that matter. I wanted to see how five classic models handle that on the same data, side by side, and wrap them in the basics a real service needs: a login, an API with tokens, and encrypted uploads.',
    rows: [
      {
        title: '1 · Train the models',
        nodes: [
          {
            id: 'data',
            label: 'Dataset',
            sub: '125,973 rows · 41 features',
            what: 'The NSL-KDD training set: labelled network connections with 41 features such as protocol, service, connection flag and byte counts, plus an Attack_Type label. Text columns are label-encoded and the encoders are saved so predictions use the same mapping.',
            facts: [
              'normal 67,343 · dos 45,927 · probe 11,656',
              'r2l 995 · u2r 52',
              'Only an 11-row sample is in the repo'
            ],
            files: ['train.py', 'Dataset/testData.csv']
          },
          {
            id: 'split',
            label: 'Split and scale',
            sub: 'Stratified 80 / 20',
            what: 'The data is split 80 / 20 with the class mix kept the same in both halves, so rare attack types appear in the test set. Features are scaled with a min-max scaler.',
            why: 'The original notebook fitted the scaler on all the data, which lets test-set information leak into training. It is now fitted on the training split only.',
            facts: ['Fixed random seed 42', 'Scaler fitted on training data only'],
            files: ['train.py']
          },
          {
            id: 'models',
            label: 'Five models',
            sub: 'Compared on equal terms',
            what: 'K-nearest neighbours, a small neural network, the same network on a searched feature subset, a 200-tree Random Forest and XGBoost are all trained on the same split and scored with the same four metrics.',
            facts: [
              'ANN: 32 → 16 → softmax, 10 epochs',
              'Random Forest: 200 trees',
              'Accuracy, precision, recall and F1 saved to metrics.json'
            ],
            files: ['train.py', 'model/metrics.json']
          },
          {
            id: 'abc',
            label: 'Bee-colony search',
            sub: 'Feature subsets for the ANN',
            what: 'A simplified Artificial Bee Colony search tries random subsets of about 80% of the features, nudges one feature at a time and keeps the subset that scores best. The neural network is then trained on that subset.',
            facts: [
              '3 candidate subsets, up to 10 rounds',
              'Stops at the first improvement',
              'Best subset saved and reused at prediction time'
            ],
            files: ['train.py', 'model/best_features.pckl']
          }
        ]
      },
      {
        title: '2 · Serve and protect',
        nodes: [
          {
            id: 'login',
            label: 'Login and tokens',
            sub: 'Session + JWT',
            what: 'The web pages use a normal login session. Scripts get a JWT from /api/login and send it with each request. Passwords are compared in constant time. In production mode the app refuses to start unless every secret is set.',
            facts: [
              'SECRET_KEY, JWT_SECRET_KEY, AES_KEY, API_USERNAME and API_PASSWORD required in production',
              'Secrets live in .env, which is not committed'
            ],
            files: ['app.py', 'config.py']
          },
          {
            id: 'aes',
            label: 'AES-256-CBC',
            sub: 'Encrypt, then decrypt',
            what: 'An uploaded CSV is encrypted with a fresh random IV, then decrypted on the server before it reaches the models. It demonstrates the secure-transmission idea the project is named for.',
            facts: ['256-bit key from the environment', 'IV prepended, output base64', 'PKCS7 padding'],
            files: ['encryption.py']
          },
          {
            id: 'predict',
            label: 'Predict',
            sub: 'All five models at once',
            what: 'The saved encoders and scaler prepare the rows, every model predicts, and the page shows one badge per model for each traffic sample so disagreements are easy to spot. The API does the same for JSON rows and checks that each row has exactly the expected number of numeric features.',
            facts: [
              'Web upload: POST /PredictAction',
              'API: POST /api/predict with a Bearer token',
              'On the 11-row sample the five models agree on 7 rows and differ on 4'
            ],
            files: ['app.py']
          },
          {
            id: 'dash',
            label: 'Dashboard',
            sub: 'Bar and radar charts',
            what: 'Reads model/metrics.json and draws accuracy, precision, recall and F1 for every model, so the comparison is visible before anything is uploaded.',
            facts: ['Chart.js bar and radar charts', 'Docker image runs as a non-root user'],
            files: ['templates/index.html', 'Dockerfile']
          }
        ]
      }
    ],
    challenge: {
      title: 'Accuracy told only half the story',
      text: 'KNN scores 96.3% accuracy and the plain neural network 97.4%, which sounds fine. Averaged across the five traffic classes, their F1 scores are only 67.8% and 69.4%. The confusion matrices show why: on the test split neither model caught a single one of the 10 U2R attacks, and both missed about half of the 199 R2L attacks. XGBoost is the only model that stays high on both. Putting accuracy and F1 side by side for every model is what made that visible.',
      unit: '%',
      max: 100,
      series: [
        { label: 'Accuracy', key: 'acc', tone: 'is-clean' },
        { label: 'Macro F1 (all five classes)', key: 'f1', tone: 'is-swap' }
      ],
      bars: [
        { name: 'KNN', acc: 96.32, f1: 67.83 },
        { name: 'ANN', acc: 97.37, f1: 69.43 },
        { name: 'ANN + ABC', acc: 98.98, f1: 88.46 },
        { name: 'Random Forest', acc: 99.95, f1: 99.76 },
        { name: 'XGBoost', acc: 99.99, f1: 99.99 }
      ]
    },
    decisions: [
      {
        title: 'Fixing a leak in the original notebook',
        text: 'The first version fitted the scaler on the whole dataset before splitting, so the test rows had already influenced the training. I moved to a stratified 80 / 20 split and fitted the scaler on the training half only.'
      },
      {
        title: 'Train once, serve many times',
        text: 'Training moved out of the notebook into train.py. The app trains only if no saved models exist, otherwise it loads the saved scaler, encoders and all five models at startup, so each upload only runs predictions.'
      },
      {
        title: 'Two logins for two kinds of user',
        text: 'People using the pages get a session login. Scripts get short-lived JWT tokens from a separate endpoint. Both compare credentials in constant time, and the API rejects any row with the wrong number of features before it reaches a model.'
      },
      {
        title: 'Refusing to start without secrets',
        text: 'Development has clearly labelled throwaway defaults so it runs out of the box. In production mode the app raises an error unless every secret is set, so a missing key can never fall back to a default.'
      }
    ],
    limits: [
      'Scores come from a random 80 / 20 split of one dataset file, not a separate test set from another network, so real-world results would be lower.',
      'The ANN + ABC feature search picks features using the same held-out split it is scored on, so its score is slightly optimistic. The bee-colony search is also a simplified version.',
      'The AES step encrypts and decrypts inside the same server to demonstrate secure transmission. Protecting real traffic still needs HTTPS.',
      'The test split holds only 10 U2R and 199 R2L records, so the per-class scores for those two attacks rest on very few examples.',
      'The full dataset file is not in the repository, only an 11-row sample, so it has to be downloaded before retraining.',
      'There are no automated tests yet.'
    ]
  },

  servicedesk: {
    title: 'ServiceDesk-AI',
    category: 'Full-stack · AI Triage',
    lead: 'An IT helpdesk where requesters raise tickets, agents work them against business-hours SLAs, and an AI assistant suggests the category and priority while the requester types, showing the resolved tickets behind every suggestion.',
    github: 'https://github.com/praneeth-hari/ServiceDesk-AI',
    cover: 'projects/servicedesk-ai.webp',
    shotsTitle: { eyebrow: 'See it work', heading: 'From a typed sentence to an SLA clock' },
    shots: [
      {
        src: 'projects/servicedesk-triage.webp',
        width: 1440,
        height: 900,
        alt: 'New ticket form with an AI Triage Advisory panel suggesting the Network category, a priority hint and the five closest resolved tickets',
        caption:
          'The new-ticket page. As the requester types, the panel suggests a category and priority and lists the closest resolved tickets as evidence, with the measured accuracy printed underneath. A suggestion only fills the form when the user clicks Apply.'
      },
      {
        src: 'projects/servicedesk-ticket.webp',
        width: 1440,
        height: 900,
        alt: 'Ticket detail page with SLA status, activity history, a reply box with an internal note option, and similar tickets',
        caption:
          'A resolved ticket as an agent sees it: SLA status, the full status history with who changed what, a reply box with a private internal-note option, and similar tickets. AI assist shows as off because it needs a local Ollama model.'
      },
      {
        src: 'projects/servicedesk-reports.webp',
        width: 1440,
        height: 900,
        alt: 'Reports page with ticket totals, tickets created per day, tickets by status and SLA by priority',
        caption:
          'The admin reports page. Every figure is computed by raw SQL (CTEs and window functions) on the live database. Dates on this page are in UTC.'
      }
    ],
    stack: [
      'Python',
      'FastAPI',
      'SQLAlchemy',
      'Alembic',
      'MySQL 8',
      'Redis',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Vite',
      'scikit-learn',
      'Ollama',
      'Docker',
      'Caddy',
      'GitHub Actions',
      'pytest',
      'Playwright'
    ],
    stats: [
      { value: '485', label: 'backend tests passing', note: '7 more need a MySQL server' },
      {
        value: '12',
        label: 'automated checks on every pull request',
        note: 'tests, MySQL, browser, security'
      },
      {
        value: '87.5%',
        label: 'category accuracy with an LLM and examples',
        note: '120 held-out tickets, synthetic'
      },
      { value: '9', label: 'reports written as raw SQL', note: 'CTEs and RANK()' }
    ],
    problem:
      'Most helpdesk demos stop at a ticket list. I wanted the parts that make a real one hard: a clock that counts only working hours and pauses while the requester is slow to reply, roles that cannot see each other’s tickets, and an AI that helps without ever being trusted blindly. So every AI suggestion shows the resolved tickets it came from, never changes a ticket by itself, and sits next to its measured accuracy.',
    rows: [
      {
        title: '1 · A ticket’s life',
        nodes: [
          {
            id: 'app',
            label: 'React + FastAPI',
            sub: 'One service, three roles',
            what: 'The React 19 and TypeScript app is built once and served by FastAPI itself, so the whole thing runs as one service on one port. Requesters, agents and admins sign in with JWTs. A requester who asks for someone else’s ticket gets a 404, not a 403, so the ticket’s existence is not revealed.',
            facts: [
              'Roles: requester, agent, admin',
              'Internal notes are hidden from requesters',
              'Signing out revokes all of a user’s tokens'
            ],
            files: ['app/main.py', 'app/api/deps.py', 'web/src/']
          },
          {
            id: 'flow',
            label: 'Status workflow',
            sub: 'Invalid moves return 409',
            what: 'A ticket moves open, in progress, waiting on requester, resolved, closed, and a resolved ticket can be reopened. Any other move is rejected with a 409. Every change is written to a history table with who made it.',
            why: 'Two agents can click at the same moment. The ticket row is locked while the change is checked and saved, so they are applied one after the other instead of both acting on the old state.',
            facts: [
              'Row lock on status, assign and edit',
              'History keeps the old status, the new status and the author'
            ],
            files: ['app/services/tickets.py']
          },
          {
            id: 'sla',
            label: 'SLA clock',
            sub: '09:00–18:00 IST, holidays skipped',
            what: 'Due dates count only working hours, Monday to Friday, and skip the holidays that admins manage. While a ticket waits on the requester the clock is paused. When it resumes, the due date moves forward by the exact business minutes spent waiting.',
            facts: [
              'Pause time is rebuilt from the status history',
              'Property-based tests generate dates to check the maths'
            ],
            files: ['app/core/sla.py', 'app/services/holidays.py']
          },
          {
            id: 'db',
            label: 'MySQL',
            sub: '12 migrations',
            what: 'SQLAlchemy 2 models and 12 Alembic migrations on MySQL 8. Most tests run on in-memory SQLite for speed, and a separate CI job runs the migrations and the MySQL-only tests against a real MySQL server.',
            facts: ['Raw SQL for the 9 reports', 'Schema changes are always migrations'],
            files: ['alembic/versions/', 'app/models/', 'app/services/reports.py']
          }
        ]
      },
      {
        title: '2 · AI triage',
        nodes: [
          {
            id: 'embed',
            label: 'Embedding',
            sub: 'Hashing · 4,096 numbers',
            what: 'Each ticket’s title and description become a vector of 4,096 numbers built from word pairs and 3 to 5 letter fragments, scaled to length 1. It needs no model download and gives the same result every time. A sentence-embedding model (MiniLM) can be swapped in.',
            why: 'No setup and about a millisecond per ticket, at the cost of matching words rather than meaning (see the chart below).',
            facts: [
              'Stored with each ticket and refreshed when the text changes',
              'Optional sentence-transformers embedder'
            ],
            files: ['app/ai/embedder.py', 'app/services/triage.py']
          },
          {
            id: 'suggest',
            label: 'Suggest',
            sub: 'kNN vote · duplicates',
            what: 'The new ticket is compared with resolved and closed tickets. The five nearest each vote for their category and priority, weighted by similarity, and the winning share of the vote is the confidence. Unresolved tickets above 0.80 similarity are flagged as possible duplicates.',
            why: 'A vote over real past tickets can be explained: the panel lists the tickets behind it. Nothing is written to the ticket unless the user clicks Apply.',
            facts: [
              'k = 5, minimum similarity 0.12, duplicate threshold 0.80',
              'Requesters only ever see their own tickets as evidence'
            ],
            files: ['app/services/triage.py', 'app/api/routes/triage.py']
          },
          {
            id: 'guard',
            label: 'Injection guard',
            sub: '15 rules, then isolation',
            what: 'Before any text reaches an LLM, 15 pattern rules look for instruction overrides, fake system headers, pasted JSON answers and executive-urgency tricks, after undoing hidden characters and letter-spacing. A flagged ticket skips the LLM and falls back to the kNN vote. Text that passes is still wrapped in escaped delimiters and labelled as untrusted.',
            why: 'The pattern rules are a cheap first filter, not the whole defence. On an independent set of 30 attacks they caught 11, and the prompt isolation did most of the work (attack success 6.7%).',
            facts: ['0.0% false positives on 220 clean tickets', 'Never stores or returns the ticket text'],
            files: ['app/ai/injection_guard.py', 'app/ai/llm_triage.py']
          },
          {
            id: 'llm',
            label: 'Optional LLM',
            sub: 'Ollama · five examples',
            what: 'When switched on, a local model through Ollama gets the ticket plus the five closest resolved tickets and answers with a category and a priority from fixed lists. If Ollama is down, slow or answers badly, the app falls back to the kNN vote, so ticket creation never waits on the model.',
            facts: [
              'The answer must match the allowed category and priority lists',
              'About 2.4 seconds per ticket in the benchmark run'
            ],
            files: ['app/ai/llm_triage.py', 'app/services/triage.py']
          }
        ]
      },
      {
        title: '3 · Keep it running',
        nodes: [
          {
            id: 'assist',
            label: 'Agent assist',
            sub: 'Summary and draft reply',
            what: 'Agents can ask a local model for a ticket summary or a draft reply. Internal notes are never sent. Key facts in a summary are dropped unless their exact value appears in the ticket text, and a draft is only inserted into the reply box, never posted.',
            facts: ['Off by default, agents and admins only', '10 requests a minute per user'],
            files: ['app/ai/assist.py', 'app/api/routes/assist.py']
          },
          {
            id: 'rails',
            label: 'Safety rails',
            sub: 'Rate limits · locks',
            what: 'Sign-in locks after 5 failed tries in 5 minutes for an email and address. Registration, triage and assist have their own limits, shared across servers when Redis is configured. The last active admin cannot be demoted or deactivated, even by two admins acting at the same moment.',
            facts: ['Passwords are hashed with bcrypt', 'Sign-in takes the same time for unknown emails'],
            files: ['app/core/rate_limit.py', 'app/services/users.py']
          },
          {
            id: 'ci',
            label: 'CI',
            sub: '12 checks per pull request',
            what: 'GitHub Actions runs the unit tests with coverage, the MySQL migrations, browser tests in Playwright, lint, CodeQL, a Trivy container scan, Bandit and pip-audit, npm audit and a secret scan on every change.',
            facts: ['485 backend tests pass, 7 need a MySQL server', 'Dependabot keeps dependencies updated'],
            files: ['.github/workflows/']
          },
          {
            id: 'deploy',
            label: 'Deploy',
            sub: 'Docker · Caddy · metrics',
            what: 'A multi-stage Dockerfile builds the web app and the API into one image. A production compose file adds Caddy for HTTPS, Redis for shared rate limits and optional Prometheus metrics. Production mode refuses to start with a placeholder secret key or with demo sign-in switched on.',
            facts: ['Configuration checked, not yet run on a live server'],
            files: ['Dockerfile', 'docker-compose.prod.yml']
          }
        ]
      }
    ],
    challenge: {
      title: 'The default scores 62.5%; the best setup scores 87.5%',
      text: 'I measured every triage method on the same 120 held-out tickets (ServiceDesk-600, which is synthetic). The default needs no downloads and answers in about a millisecond, but it only matches words, so it gets 62.5%. A small sentence-embedding model reaches 76.7%, and a local LLM shown the five closest resolved tickets reaches 87.5% at about 2.4 seconds per ticket. Always guessing the biggest class scores 16.7%. So the app keeps the cheap method as the default and as the fallback, and lets you switch the LLM on.',
      unit: '%',
      max: 100,
      series: [
        { label: 'Always guess the biggest class', key: 'majority', tone: 'is-clean' },
        { label: 'Default: hashing + kNN', key: 'hashing', tone: 'is-clean' },
        { label: 'MiniLM + kNN', key: 'minilm', tone: 'is-clean' },
        { label: 'LLM, no examples', key: 'zero', tone: 'is-clean' },
        { label: 'LLM + 5 closest tickets', key: 'rag', tone: 'is-swap' }
      ],
      bars: [
        {
          name: 'Category accuracy on 120 held-out tickets',
          majority: 16.7,
          hashing: 62.5,
          minilm: 76.7,
          zero: 79.2,
          rag: 87.5
        }
      ]
    },
    rag: {
      eyebrow: 'Measured on 5,000 tickets',
      title: 'Making a request cheap',
      text: 'Triage compares each new ticket with up to 5,000 stored ones. While reviewing my own code I found two problems and measured both before fixing them. These are the before and after numbers on the same data, and the suggestions did not change: 152 saved outputs matched exactly.',
      stats: [
        { value: '264 → 21 MB', label: 'memory per request', note: 'vectors scored in chunks of 500' },
        { value: '771 → 543 ms', label: 'median time per request', note: 'SQLite, 7 runs each' },
        {
          value: '48 s → 13 ms',
          label: 'injection guard on a 10,000-character ticket',
          note: 'worst case: one rule before, the whole guard after'
        },
        { value: '0', label: 'suggestions changed by the fixes', note: '152 outputs, before and after' }
      ]
    },
    decisions: [
      {
        title: 'A clock that can pause',
        text: 'The pause time is rebuilt from the status history instead of being stored, so a priority change recalculates the due date correctly. I also found and fixed a case where changing the priority while a ticket was waiting on the requester left the due date stale.'
      },
      {
        title: 'Lock the row, then decide',
        text: 'Changing a status reads the ticket, checks the move and writes it back. Without a lock, two agents acting together could both pass the check and the pause adjustment could be applied twice. The ticket row is now locked for that whole step, and a test checks that the query asks for the lock.'
      },
      {
        title: 'Show the evidence, not just the answer',
        text: 'The AI never edits a ticket. It shows the five resolved tickets behind its suggestion and the measured accuracy, so a person can overrule it in a second. If the AI layer fails, creating a ticket still works.'
      },
      {
        title: 'Fix the guard without changing what it catches',
        text: 'The guard’s patterns could take minutes on a few hundred characters of carefully repeated words, which would freeze the server. I rewrote them so the time grows with the length of the text, then compared old and new on 200,000 generated inputs and every dataset text: identical results.'
      }
    ],
    limits: [
      'The benchmark is synthetic: an LLM wrote the 600 tickets and I corrected 27 of them by hand. Real tickets are messier, so real accuracy would be lower, and 120 test tickets give wide confidence intervals (87.5% is 80.4% to 92.3%).',
      'The default method matches words, not meaning, so it scores 62.5%. The better setups need either a downloaded embedding model or a local LLM at about 2.4 seconds per ticket, and I have only measured them on this one dataset.',
      'The injection guard is a heuristic. On an independent set of 30 attacks it caught 11. The escaped prompt boundary did most of the defending, and 30 tickets are too few for firm conclusions. Keyword stuffing aimed at the similarity search is not covered at all.',
      'It has never run in production. The Docker and Caddy stack is checked for configuration only, not load-tested on a live server.',
      'Keyword search is a substring match with no full-text index, so it slows down on very large ticket tables, and pagination is offset-based.',
      'Rate limits are per process unless Redis is configured, and with Redis they let requests through if Redis cannot be reached.',
      'There are no email notifications, no refresh tokens (sessions last 30 minutes) and no two-factor sign-in.'
    ]
  },

  mediplant: {
    title: 'Medicinal Plant Detection',
    category: 'Computer Vision + RAG',
    lead: 'Take a photo of a leaf and the app names the plant in under 10 ms. Then ask it anything about that plant and a local assistant answers from verified monographs, with a source for every claim.',
    github: 'https://github.com/praneeth-hari/Medicinal-Plant-Detection',
    demo: 'https://ai-medicinal-plant-identification.vercel.app/',
    cover: 'projects/medicinal-plant.webp',
    video: {
      src: 'projects/medicinal-plant-demo.mp4',
      poster: 'projects/medicinal-plant-demo-poster.webp',
      caption:
        'One minute, start to finish: upload a leaf photo, get the species with a confidence score, then ask the cited RAG assistant about its uses.'
    },
    stack: [
      'Python',
      'PyTorch',
      'MobileNetV3',
      'FastAPI',
      'SQLite',
      'SQLAlchemy',
      'sentence-transformers',
      'FAISS',
      'Ollama',
      'Qwen 2.5 3B',
      'React',
      'Vite',
      'Tailwind CSS'
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
            id: 'photo',
            label: 'Leaf photo',
            sub: 'Upload · webcam · samples',
            what: 'A visitor drops in a photo, opens the webcam or taps a sample leaf. The browser checks the format and size before anything is sent.',
            facts: ['JPG / PNG only', '5 MB limit in the browser'],
            files: ['frontend/src/pages/PlantDetection.jsx']
          },
          {
            id: 'react',
            label: 'React app',
            sub: 'Vite · Tailwind · Axios',
            what: 'Sends the image to the API and shows the best match with a confidence percentage. Below 70% it shows an amber warning asking for a clearer, closer photo of a single leaf.',
            facts: ['React 18 + Vite 6', 'Tailwind CSS + Framer Motion', 'Low-confidence warning under 70%'],
            files: ['frontend/src/pages/PlantDetection.jsx', 'frontend/src/api/client.js']
          },
          {
            id: 'api',
            label: 'FastAPI',
            sub: 'POST /api/v1/detect',
            what: 'Receives the upload, enforces a 10 MB limit, saves it under a random file name and calls the model. Each result is stored so the detection history can be shown later.',
            facts: [
              'Endpoints → services → repositories → database',
              '10 MB server limit',
              'Random UUID file names'
            ],
            files: ['backend/api/v1/endpoints/detection.py', 'backend/services/detection_service.py']
          },
          {
            id: 'cnn',
            label: 'MobileNetV3-Small',
            sub: '78 species · 9.09 ms',
            what: 'A PyTorch image classifier fine-tuned on the Indian Medicinal Leaves dataset (6,884 images, 78 classes). At prediction time it looks at 2 to 5 crops of the photo (the whole leaf plus zoomed regions) and averages their predictions.',
            why: 'It is fast and lightweight, so it answers in under 10 ms without needing an expensive GPU.',
            facts: [
              'New head: 576 → 1024 → 78',
              '224 × 224 input, top-5 predictions returned',
              '9.09 ms average, one image at a time, on GPU'
            ],
            files: ['ml/model.py', 'ml/predict.py', 'ml/train.py']
          },
          {
            id: 'db',
            label: 'SQLite',
            sub: 'Monographs · history',
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
            id: 'ask',
            label: 'Question',
            sub: 'From the plant card or chat',
            what: 'The user taps a question on the detection card or types one in the assistant. It is sent to POST /api/v1/chat together with the conversation.',
            facts: ['Multi-turn chat sessions', 'Saved in SQLite'],
            files: ['frontend/src/pages/RAGAssistant.jsx', 'frontend/src/api/chat.js']
          },
          {
            id: 'guard',
            label: 'Guardrails',
            sub: 'AI Control Tower',
            what: 'Before retrieval the message is scanned for harmful intent (blocked with a clear message) and personal data such as emails, phone numbers and patient IDs is masked. Every request is logged with its latency and status.',
            why: 'Built in as a small governance layer, so no outside monitoring service is needed.',
            facts: [
              'Toxic queries are blocked',
              'Personal data is masked',
              'Audit log of the last 100 requests',
              'Dosage questions get a medical disclaimer'
            ],
            files: ['backend/services/chat_service.py', 'backend/services/metrics.py']
          },
          {
            id: 'embed',
            label: 'MiniLM embeddings',
            sub: '384 dimensions',
            what: 'Turns the question and the plant text chunks into vectors, so text with similar meaning ends up close together.',
            why: 'A fast, lightweight embedding model.',
            facts: [
              'all-MiniLM-L6-v2',
              'Chunks of 500 characters, 50 overlap',
              'Reviewed monographs are split by section'
            ],
            files: ['backend/rag/embeddings.py']
          },
          {
            id: 'faiss',
            label: 'FAISS index',
            sub: '77 chunks · 23 plants',
            what: 'Stores the vectors on disk and finds the closest chunks by cosine similarity.',
            why: 'It needs no server process. I removed ChromaDB and LangChain in favour of plain faiss-cpu to avoid dependency conflicts and keep everything self-contained.',
            facts: [
              'IndexFlatIP on normalised vectors',
              'Chunk tags: uses, preparation, safety, misconceptions'
            ],
            files: ['backend/rag/vector_store.py']
          },
          {
            id: 'retriever',
            label: 'Retriever',
            sub: 'Re-ranks · top 5',
            what: 'Fetches extra candidates, boosts chunks about the plant named in the question (+0.25), penalises off-target ones (−0.10) and keeps the best five. Plant names come from the index itself and match whole words only.',
            why: 'Plain vector search sometimes ranked another plant’s chunk above the right one. This re-ranking fixed it (see decisions below).',
            facts: [
              'top_k = 5, searches max(2×k, 10)',
              'Up to top_k chunks per plant',
              'Whole-word matching: "pea" does not match "appear"'
            ],
            files: ['backend/rag/retriever.py']
          },
          {
            id: 'llm',
            label: 'Qwen 2.5 (3B)',
            sub: 'Local · via Ollama',
            what: 'Writes the answer using only the retrieved chunks, with a [Source N] marker on every claim. Seven prompt rules: no outside knowledge, say what is missing, always surface safety warnings, and never present a misconception as a benefit.',
            why: 'It runs on the user’s own computer, so health questions are never sent to an outside API. It is free, private and works offline.',
            facts: [
              'Temperature 0.3, up to 512 tokens',
              'A fixed refusal sentence when nothing relevant is found'
            ],
            files: ['backend/rag/generator.py', 'backend/rag/pipeline.py']
          },
          {
            id: 'answer',
            label: 'Cited answer',
            sub: 'Source pills',
            what: 'The reply shows tappable source pills with a relevance percentage and an expandable snippet, and links to the plant’s full monograph.',
            facts: ['Citations parsed from [Source N]', 'Snippets of 200 characters'],
            files: ['frontend/src/pages/RAGAssistant.jsx']
          }
        ]
      }
    ],
    challenge: {
      title: 'The score I trust is the lower one',
      text: 'My first model scored 93.9% on the test set. Then I swapped the photo backgrounds and it fell to 43.5%. It had learned the background (neem leaves on stone floors, curry leaves on white paper), not the leaf. I wrote a BackgroundSwap augmentation that cuts the leaf out by colour and pastes it onto varied backgrounds, then retrained. The final model scores less on the original photos but holds up when the background changes.',
      bars: [
        { name: 'First model', clean: 93.9, swapped: 43.5 },
        { name: 'Final model', clean: 86.7, swapped: 78.9 }
      ]
    },
    rag: {
      title: 'Measuring the retrieval',
      text: 'I wrote an evaluation set of 89 questions and track whether the right chunks come back, so changes to the retriever are measured instead of guessed.',
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
