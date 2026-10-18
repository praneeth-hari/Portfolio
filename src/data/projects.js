/*
 * Case-study content. Every number below comes from the project's own repo
 * (README, evaluation reports and training_metrics_report.json).
 */
export const PROJECTS = {
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
