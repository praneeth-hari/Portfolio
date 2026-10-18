/*
 * Everything the chatbot knows about Hari. One chunk = one small fact group.
 * Edit this file to update the bot; nothing else needs to change.
 * Files starting with "_" in /api are not exposed as endpoints by Vercel.
 */
const KNOWLEDGE = [
  {
    id: 'summary',
    title: 'Summary',
    text: 'Kurapati Hari Praneeth is a Generative AI engineer based in Hyderabad, India. He focuses on LLM applications, RAG (retrieval-augmented generation) and Python. He is an AI Engineering Intern at Breviq AI, working on the Navent AI clinical AI platform, where he builds LLM and RAG systems with FastAPI, LangGraph and Pinecone: medical-code retrieval, rule-based coding validation, retrieval evaluation and a real-time voice query system.'
  },
  {
    id: 'contact',
    title: 'Contact',
    text: 'You can contact Hari by email at kurapatiharipraneeth2004@gmail.com, on LinkedIn at linkedin.com/in/kurapati-hari-praneeth-0a6699259, or see his code on GitHub at github.com/praneeth-hari. The contact form on this website also reaches him. His resume can be read or downloaded from the About section.'
  },
  {
    id: 'skills',
    title: 'Skills',
    text: 'Languages: Python. AI / ML: PyTorch, TensorFlow/Keras, scikit-learn, XGBoost, Hugging Face Transformers, Sentence-Transformers. Generative AI: LLMs, RAG, LangGraph, prompt engineering, LLM evaluation, Ollama. Retrieval and data: Pinecone, FAISS, PostgreSQL. Backend and web: FastAPI, Flask, REST APIs, JWT, React, AWS (S3, STS, SQS, Chime, Polly, Transcribe), Docker, Git, GitHub.'
  },
  {
    id: 'exp-role',
    title: 'Experience: Breviq AI',
    text: 'Since June 2026 Hari has been an AI Engineering Intern at Breviq AI in Hyderabad, India, working on Navent AI, a clinical AI platform. Stack: Python, FastAPI, LangGraph, Pinecone, PostgreSQL, AWS S3, AWS Chime and LLMs. He built clinical documentation workflows in Python, FastAPI and LangGraph that pair RAG retrieval with LLM analysis across 5 healthcare domains.'
  },
  {
    id: 'exp-retrieval',
    title: 'Experience: retrieval benchmark',
    text: 'At Navent AI, Hari built an embedding benchmark and migrated clinical-code retrieval from ClinicalBERT to BGE on Pinecone. CDT Recall@10 increased from 61.3% to 84.7%, while embedding storage decreased by 69%.'
  },
  {
    id: 'exp-validators',
    title: 'Experience: coding validators',
    text: 'At Navent AI, Hari implemented deterministic Python validators for medical, dental and physical-therapy coding, including 12 medical inference guards, negation checks, dental billing rules and CMS 8-minute rule validation.'
  },
  {
    id: 'exp-voice',
    title: 'Experience: Navent Voice',
    text: 'Hari built Navent Voice, a real-time CDI (clinical documentation integrity) query resolution system that integrates AWS Chime, Transcribe, Polly and LLMs, with conversational state management and safety guardrails.'
  },
  {
    id: 'exp-backend',
    title: 'Experience: backend work',
    text: 'Hari extended the Navent AI FastAPI backend with event-loop offloading, S3/STS storage, SQS batch processing, PostgreSQL persistence and document merging.'
  },
  {
    id: 'proj-overview',
    title: 'Projects overview',
    text: 'Hari has four main projects. 1) MediPlant AI: identifies 78 medicinal plant species from a photo, with a local RAG assistant that cites sources (PyTorch, FastAPI, FAISS, Ollama, React). 2) Secure Cloud ML: a Flask network intrusion detection system on the NSL-KDD dataset where XGBoost reached 99.99% accuracy, with AES-256 encryption, JWT APIs and Docker. 3) AI Stock Trader: a paper-trading system for 25 US stocks with ML signals, a risk engine and a live dashboard (paper trading only, not real money). 4) BOB Personal AI Assistant: a 100% offline Windows assistant with a local LLM, 11 PC-control tools and voice input and output. Code for the projects is on github.com/praneeth-hari.'
  },
  {
    id: 'proj-mediplant',
    title: 'Project: MediPlant AI',
    text: 'MediPlant AI (Medicinal Plant Detection, Jun 2025 to Nov 2025) identifies 78 medicinal plant species from a photo in about 9 ms, then a local RAG assistant answers plant-specific questions with source citations. Stack: Python, PyTorch, FastAPI, FAISS, Sentence-Transformers, Ollama and React. A live demo is at ai-medicinal-plant-identification.vercel.app and the code is at github.com/praneeth-hari/Medicinal-Plant-Detection.'
  },
  {
    id: 'proj-mediplant-results',
    title: 'Project: MediPlant AI results',
    text: 'For MediPlant AI, Hari trained MobileNetV3-Small on 6,884 images across 78 species, reaching 93.9% test accuracy and 0.94 macro F1. Background augmentation raised accuracy under background shift from 43.5% to 77.6%. Its entity-aware FAISS retrieval pipeline uses MiniLM embeddings and plant-specific reranking; on an 89-question benchmark it reached 100% Hit@1 for plant retrieval and 100% Hit@5 for answer-chunk recall.'
  },
  {
    id: 'proj-securecloud',
    title: 'Project: Secure Cloud ML',
    text: 'Secure Cloud ML (Enhancing Data Transmission Security in Cloud Using Machine Learning, Dec 2025 to Mar 2026) is a Flask network intrusion detection system on the NSL-KDD dataset (125,973 records, 41 features) that classifies traffic into 5 classes. It compares 5 ML models; XGBoost scored 99.99% accuracy and 99.99% macro F1, ahead of Random Forest and ANN-based models. It adds AES-256-CBC encryption, JWT-authenticated REST APIs and Docker packaging. Code: github.com/praneeth-hari/Secure-Cloud-Ml.'
  },
  {
    id: 'proj-trader',
    title: 'Project: AI Stock Trader',
    text: 'AI Stock Trader (2026) is a paper-trading system for 25 US stocks with ML signals, a risk engine that can veto any trade, walk-forward backtests and a live dashboard, benchmarked honestly against SPY. It is paper trading only, not real money. Stack: Python, scikit-learn, Streamlit, SQLAlchemy. Code: github.com/praneeth-hari/ai-stock-trader.'
  },
  {
    id: 'proj-bob',
    title: 'Project: BOB Personal AI Assistant',
    text: 'BOB Personal AI Assistant (2026) is a 100% offline Windows assistant: a local LLM through Ollama, 11 PC-control tools, and voice input and output with faster-whisper and Piper. Code: github.com/praneeth-hari/BOB-Personal-AI-Assistant.'
  },
  {
    id: 'education',
    title: 'Education',
    text: "Hari completed a B.Tech in Information Technology at St. Peter's Engineering College, Hyderabad (2022 to 2026). Before that he did Intermediate education (Science, Mathematics) at Bhavan's Sri Aurobindo Junior College (2020 to 2022)."
  },
  {
    id: 'certs',
    title: 'Certifications',
    text: 'Certifications: AI Engineer Associate Certificate Course (Udemy, Sep 2026) and Machine Learning & AI Foundations Course (Data Science Academy, Udemy, Sep 2026).'
  },
  {
    id: 'awards',
    title: 'Awards',
    text: "Hari won 1st Prize at his college Project Expo at St. Peter's Engineering College, presenting his medicinal plant detection app. He wrote about the win, and finishing his B.Tech, on LinkedIn in July 2026."
  },
  {
    id: 'volunteering',
    title: 'Volunteering',
    text: 'In 2023 Hari volunteered at a promotion event for the Go Extra Mile app, organised by the app owner. He explained the app to visitors, helped run the event and spoke on stage.'
  }
];

export default KNOWLEDGE;
