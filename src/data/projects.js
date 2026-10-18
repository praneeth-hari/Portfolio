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

  securecloud: {
    title: 'Secure Cloud ML',
    category: 'Machine Learning · Security',
    lead:
      'A Flask web app that sorts network traffic into normal or four kinds of attack, running five different models side by side on every upload, with AES-256 encryption on the upload path and a token-protected API.',
    github: 'https://github.com/praneeth-hari/Secure-Cloud-Ml',
    cover: 'projects/secure-cloud-ml.png',
    shotsTitle: { eyebrow: 'See it work', heading: 'Upload traffic, get five verdicts' },
    shots: [
      {
        src: 'projects/secure-cloud-predict.webp',
        alt: 'Prediction results table where five models classify 11 network traffic samples as normal, dos, r2l or u2r',
        caption: 'The prediction page after uploading the 11-row sample. Every model labels every row, so you can see where they agree and where they split: on 4 of the 11 rows at least one model disagrees.',
      },
      {
        src: 'projects/secure-cloud-dashboard.webp',
        alt: 'Model performance dashboard with accuracy, F1, precision and recall cards and bar and radar charts for five models',
        caption: 'The model dashboard: the best scores up top, then bar and radar charts that put all five models on the same axes.',
      },
    ],
    stack: [
      'Python', 'Flask', 'scikit-learn', 'XGBoost', 'TensorFlow / Keras', 'pandas', 'pycryptodome',
      'Flask-JWT-Extended', 'Chart.js', 'Docker', 'Waitress'
    ],
    stats: [
      { value: '5', label: 'models compared on every upload', note: 'KNN · ANN · ANN + ABC · Random Forest · XGBoost' },
      { value: '99.99%', label: 'XGBoost accuracy', note: '20% held-out split' },
      { value: '125,973', label: 'traffic records, 41 features each', note: 'NSL-KDD training set, 5 classes' },
      { value: '256-bit', label: 'AES encryption on the upload path', note: 'random IV on every message' }
    ],
    problem:
      'In the NSL-KDD intrusion data, 125,973 records include 67,343 normal ones but only 995 R2L attacks and just 52 U2R attacks, so a single accuracy number can look great while the model misses the attacks that matter. I wanted to see how five classic models handle that on the same data, side by side, and wrap them in the basics a real service needs: a login, an API with tokens, and encrypted uploads.',
    rows: [
      {
        title: '1 · Train the models',
        nodes: [
          {
            id: 'data', label: 'Dataset', sub: '125,973 rows · 41 features',
            what: 'The NSL-KDD training set: labelled network connections with 41 features such as protocol, service, connection flag and byte counts, plus an Attack_Type label. Text columns are label-encoded and the encoders are saved so predictions use the same mapping.',
            facts: ['normal 67,343 · dos 45,927 · probe 11,656', 'r2l 995 · u2r 52', 'Only an 11-row sample is in the repo'],
            files: ['train.py', 'Dataset/testData.csv']
          },
          {
            id: 'split', label: 'Split and scale', sub: 'Stratified 80 / 20',
            what: 'The data is split 80 / 20 with the class mix kept the same in both halves, so rare attack types appear in the test set. Features are scaled with a min-max scaler.',
            why: 'The original notebook fitted the scaler on all the data, which lets test-set information leak into training. It is now fitted on the training split only.',
            facts: ['Fixed random seed 42', 'Scaler fitted on training data only'],
            files: ['train.py']
          },
          {
            id: 'models', label: 'Five models', sub: 'Compared on equal terms',
            what: 'K-nearest neighbours, a small neural network, the same network on a searched feature subset, a 200-tree Random Forest and XGBoost are all trained on the same split and scored with the same four metrics.',
            facts: ['ANN: 32 → 16 → softmax, 10 epochs', 'Random Forest: 200 trees', 'Accuracy, precision, recall and F1 saved to metrics.json'],
            files: ['train.py', 'model/metrics.json']
          },
          {
            id: 'abc', label: 'Bee-colony search', sub: 'Feature subsets for the ANN',
            what: 'A simplified Artificial Bee Colony search tries random subsets of about 80% of the features, nudges one feature at a time and keeps the subset that scores best. The neural network is then trained on that subset.',
            facts: ['3 candidate subsets, up to 10 rounds', 'Stops at the first improvement', 'Best subset saved and reused at prediction time'],
            files: ['train.py', 'model/best_features.pckl']
          }
        ]
      },
      {
        title: '2 · Serve and protect',
        nodes: [
          {
            id: 'login', label: 'Login and tokens', sub: 'Session + JWT',
            what: 'The web pages use a normal login session. Scripts get a JWT from /api/login and send it with each request. Passwords are compared in constant time. In production mode the app refuses to start unless every secret is set.',
            facts: ['SECRET_KEY, JWT_SECRET_KEY, AES_KEY, API_USERNAME and API_PASSWORD required in production', 'Secrets live in .env, which is not committed'],
            files: ['app.py', 'config.py']
          },
          {
            id: 'aes', label: 'AES-256-CBC', sub: 'Encrypt, then decrypt',
            what: 'An uploaded CSV is encrypted with a fresh random IV, then decrypted on the server before it reaches the models. It demonstrates the secure-transmission idea the project is named for.',
            facts: ['256-bit key from the environment', 'IV prepended, output base64', 'PKCS7 padding'],
            files: ['encryption.py']
          },
          {
            id: 'predict', label: 'Predict', sub: 'All five models at once',
            what: 'The saved encoders and scaler prepare the rows, every model predicts, and the page shows one badge per model for each traffic sample so disagreements are easy to spot. The API does the same for JSON rows and checks that each row has exactly the expected number of numeric features.',
            facts: ['Web upload: POST /PredictAction', 'API: POST /api/predict with a Bearer token', 'On the 11-row sample the five models agree on 7 rows and differ on 4'],
            files: ['app.py']
          },
          {
            id: 'dash', label: 'Dashboard', sub: 'Bar and radar charts',
            what: 'Reads model/metrics.json and draws accuracy, precision, recall and F1 for every model, so the comparison is visible before anything is uploaded.',
            facts: ['Chart.js bar and radar charts', 'Docker image runs as a non-root user'],
            files: ['templates/index.html', 'Dockerfile']
          }
        ]
      }
    ],
    challenge: {
      title: 'Accuracy told only half the story',
      text:
        'KNN scores 96.3% accuracy and the plain neural network 97.4%, which sounds fine. Averaged across the five traffic classes, their F1 scores are only 67.8% and 69.4%. The confusion matrices show why: on the test split neither model caught a single one of the 10 U2R attacks, and both missed about half of the 199 R2L attacks. XGBoost is the only model that stays high on both. Putting accuracy and F1 side by side for every model is what made that visible.',
      unit: '%', max: 100,
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

  bob: {
    title: 'BOB Personal AI Assistant',
    category: 'Local LLM · Voice · Automation',
    lead:
      'A voice assistant for Windows that listens with Whisper, decides with a local Ollama model or NVIDIA’s cloud, and acts through 11 tools. Apps are allow-listed and system processes are protected, so it can open, close and adjust things but cannot delete files or shut the PC down.',
    github: 'https://github.com/praneeth-hari/BOB-Personal-AI-Assistant',
    cover: 'projects/bob-assistant.png',
    stack: [
      'Python', 'faster-whisper', 'Ollama', 'Qwen 2.5 3B', 'NVIDIA NIM', 'Piper TTS', 'ONNX Runtime',
      'sounddevice', 'pywin32', 'pycaw', 'psutil', 'DuckDuckGo search', 'pytest'
    ],
    stats: [
      { value: '11', label: 'tools BOB can call', note: '10 PC controls + web search' },
      { value: '19 / 20', label: 'spoken commands routed to the right tool', note: 'local qwen2.5 3B' },
      { value: '728', label: 'automated tests passing', note: '0 failed, 1 skipped' },
      { value: '0', label: 'tools that can delete files or shut down', note: 'apps are allow-listed' }
    ],
    problem:
      'BOB is a local-first assistant: it should run on my own laptop without a paid API, keep the conversation on the machine when it uses the local model, and only be able to do safe things on the PC, even when the language model makes a mistake.',
    rows: [
      {
        title: '1 · Hear and decide',
        nodes: [
          {
            id: 'mic', label: 'Microphone', sub: 'Voice activity detection',
            what: 'Typing "voice" in the terminal starts listening. BOB records 16 kHz mono audio and decides a phrase has ended after 1.2 seconds of silence, measured by audio energy. Saying "stop listening" ends voice mode.',
            facts: ['Silence threshold 0.015 RMS', 'Up to 30 seconds per phrase', 'Stops voice mode after 3 audio-device errors in a row'],
            files: ['app/voice/audio_recorder.py', 'app/interfaces/cli.py']
          },
          {
            id: 'stt', label: 'faster-whisper', sub: 'base model · 141 MB',
            what: 'Turns speech into text and detects the language automatically. On start-up it runs a 100 ms silent test clip on the GPU; if the CUDA libraries are missing it falls back to the CPU with int8 instead of crashing.',
            why: 'The app keeps working on machines without a full CUDA setup. The cost on my laptop: 4.79 seconds to transcribe a 5-second clip on the CPU.',
            facts: ['GPU float16, or CPU int8 as the fallback', 'Median 4.79 s for a 5-second clip (CPU)'],
            files: ['app/voice/stt.py']
          },
          {
            id: 'llm', label: 'LLM', sub: 'Ollama local · NVIDIA cloud',
            what: 'Either qwen2.5 3B (1.9 GB) running in Ollama on the laptop, or gpt-oss-20b on NVIDIA NIM. When the cloud is the main model, the local one is registered as a silent fallback: if the cloud call fails, BOB rolls the turn back and retries locally.',
            why: 'The assistant only depends on a small client interface, so switching between cloud, local or a test client needs no change to the assistant code.',
            facts: ['Local model talks to Ollama on localhost only', 'Up to 4,096 tokens per cloud reply'],
            files: ['app/llm/factory.py', 'app/llm/ollama_client.py', 'app/llm/nvidia_client.py']
          },
          {
            id: 'calls', label: 'Tool calling', sub: 'Native + text fallback',
            what: 'The model gets a schema for every tool and replies with a structured tool call. Small models sometimes write the call as JSON text instead, so a fallback parser reads it and only accepts it if the name matches a real tool.',
            why: 'Without the fallback, a 3B model that writes {"name": "get_system_info"} as text would simply fail to act.',
            facts: ['19 of 20 test commands picked the right tool', 'Unknown tool names are rejected'],
            files: ['app/core/assistant.py']
          }
        ]
      },
      {
        title: '2 · Act and answer',
        nodes: [
          {
            id: 'tools', label: '11 tools', sub: '10 PC controls + web search',
            what: 'System info (CPU, RAM, disk, GPU), open and close apps, list running apps, search files, search the whole computer, battery status, volume, screen brightness, window control and web search.',
            facts: ['Read-only: system info, running apps, file search, battery, web search', 'Changes things: open / close apps, volume, brightness, windows', 'Windows APIs through pywin32, pycaw and psutil'],
            files: ['app/tools/registry.py', 'app/tools/']
          },
          {
            id: 'rails', label: 'Safety rails', sub: 'Allow-list · blocklist',
            what: 'Only 7 allow-listed apps can be opened (Notepad, Calculator, Paint, Explorer, WordPad, VS Code, Snipping Tool), always without a shell. 14 system processes, including Ollama itself, cannot be closed. File search skips Windows, Program Files, AppData and other system folders.',
            why: 'The model decides what to do, but the code decides what is possible. No tool can delete or move files, format drives or shut down.',
            facts: ['subprocess with shell=False', '14 protected processes', '7 protected folder names'],
            files: ['app/tools/open_application.py', 'app/tools/close_application.py', 'app/tools/search_computer.py']
          },
          {
            id: 'answer', label: 'Reply', sub: 'Result back to the model',
            what: 'The tool result goes back into the conversation and the model writes the answer. Before it is spoken, code blocks, URLs, markdown symbols and emojis are stripped so the voice does not read out "backtick backtick".',
            facts: ['Conversation history kept in memory for the session'],
            files: ['app/core/assistant.py', 'app/voice/tts.py']
          },
          {
            id: 'tts', label: 'Piper TTS', sub: 'en_US-lessac-medium · 60 MB',
            what: 'A neural voice running on ONNX Runtime turns the reply into 22,050 Hz audio and plays it through the speakers.',
            facts: ['Median 0.34 s to synthesise a 14-word sentence', 'Runs locally'],
            files: ['app/voice/tts.py']
          }
        ]
      }
    ],
    challenge: {
      title: 'The small local model beat the cloud',
      text:
        'BOB can use a 20B model on NVIDIA’s cloud or a 3B model running in Ollama on the laptop. For a short command like "open notepad", the local model finished its reply in a median of 1.03 seconds, against 16.28 seconds for the cloud model, which also took 7.7 seconds before its first word. Cloud times swing with the network and rate limits (one run took 48 seconds), which is why the local model is kept as an automatic fallback.',
      unit: ' s', max: 17,
      series: [
        { label: 'Local: qwen2.5 3B in Ollama', key: 'local', tone: 'is-clean' },
        { label: 'Cloud: gpt-oss-20b on NVIDIA NIM', key: 'cloud', tone: 'is-swap' }
      ],
      bars: [
        { name: 'Time to first token', local: 0.03, cloud: 7.72 },
        { name: 'Full reply to "open notepad"', local: 1.03, cloud: 16.28 }
      ]
    },
    rag: {
      eyebrow: 'Measured on my laptop',
      title: 'Where a voice turn spends its time',
      text:
        'Median of 5 runs each on a Ryzen 7 4800H with an RTX 3050 (4 GB) and 16 GB of RAM, using the local stack. Whisper fell back to the CPU because a CUDA library was missing, which makes listening the slowest step.',
      stats: [
        { value: '4.79 s', label: 'speech to text', note: '5-second clip, CPU int8' },
        { value: '1.03 s', label: 'local model reply', note: '"open notepad", qwen2.5 3B' },
        { value: '0.34 s', label: 'text to speech', note: '14-word sentence' },
        { value: '12.8 s', label: 'full voice turn', note: 'end of speech to reply ready' }
      ]
    },
    decisions: [
      {
        title: 'A fallback parser for small models',
        text: 'Small local models do not always return a proper tool call; some write it as a JSON block in plain text. BOB reads those blocks and accepts them only when the name matches a registered tool, so a 3B model can still act reliably.'
      },
      {
        title: 'The cloud is optional, the laptop is not',
        text: 'When the NVIDIA cloud is the main model, the local Ollama model is registered as a silent fallback. A rate limit or dropped connection rolls the turn back and retries locally, so the session keeps going.'
      },
      {
        title: 'Test the GPU before trusting it',
        text: 'Instead of failing when CUDA libraries are missing, the speech model runs a 100 ms silent clip at start-up and falls back to the CPU with int8 if the GPU path breaks.'
      },
      {
        title: 'Clean text before speaking it',
        text: 'Model replies are full of markdown, code, links and emojis. A normaliser strips them before the voice model sees the text, so the spoken answer sounds like a sentence, not a document.'
      }
    ],
    limits: [
      'There is no confirmation step: once the model picks a tool such as close_application it runs straight away, so unsaved work in that app can be lost.',
      'It is fully offline only with the local Ollama model and no web search. The NVIDIA cloud mode and web search need the internet.',
      'On my laptop speech recognition fell back to the CPU, so a full voice turn takes about 13 seconds.',
      'There is no wake word, and BOB cannot be interrupted while it is speaking except with Ctrl+C.',
      'It is Windows only and terminal only, with an English voice and no memory between sessions.',
      'The 19 / 20 tool score comes from a small set of test commands. The one miss sent a request for a poem to web search.'
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
