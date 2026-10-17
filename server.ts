import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Allow large uploads for chapter PDFs (up to 30MB base64)
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ limit: '35mb', extended: true }));

// Helper to check API Key
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    configured: hasKey,
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// PDF Verification & Diagnostic Endpoint
app.post('/api/verify-pdf', (req: Request, res: Response) => {
  try {
    const { base64Data, fileName, fileSize } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'No PDF data provided.' });
    }

    // Convert from base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Check PDF magic header %PDF-
    const header = buffer.subarray(0, 5).toString('ascii');
    if (!header.startsWith('%PDF')) {
      return res.status(400).json({
        error: 'Invalid file format: File header does not match a valid PDF document (%PDF-).',
        isValid: false,
      });
    }

    if (buffer.length === 0) {
      return res.status(400).json({
        error: 'The uploaded PDF file is empty (0 bytes).',
        isValid: false,
      });
    }

    if (buffer.length > 28 * 1024 * 1024) {
      return res.status(400).json({
        error: 'The uploaded PDF exceeds the 28MB limit for in-memory analysis. Please upload a specific chapter.',
        isValid: false,
      });
    }

    // Estimate page count by counting /Type /Page occurrences (heuristic)
    const pdfText = buffer.toString('binary');
    const pageMatches = pdfText.match(/\/Type\s*\/Page[^s]/g);
    const estimatedPages = pageMatches ? pageMatches.length : 1;

    // Check if it appears to be scanned or text-based
    const hasFontStreams = pdfText.includes('/Font') || pdfText.includes('/Type /Font');
    const hasImageXObjects = pdfText.includes('/Subtype /Image');
    const isLikelyScanned = !hasFontStreams && hasImageXObjects;

    return res.json({
      isValid: true,
      fileName: fileName || 'document.pdf',
      sizeBytes: buffer.length,
      estimatedPages: Math.max(1, estimatedPages),
      isLikelyScanned,
      infoNote: isLikelyScanned
        ? 'Document appears to be image/scanned pages. VidyaAI will use Gemini Multimodal Vision OCR to extract text and diagrams.'
        : 'Text and structural streams detected. Full chapter analysis ready.',
    });
  } catch (err: any) {
    console.error('PDF verification error:', err);
    return res.status(500).json({ error: 'Failed to inspect PDF: ' + (err.message || 'Unknown error') });
  }
});

// Core AI Chatbot Endpoint (with Streaming SSE support)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, language = 'English', subjectContext, stream = true } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'A list of messages is required.' });
    }

    const ai = getGeminiClient();

    // Prepare system instructions tailored for Indian & global curriculum students
    const systemInstruction = `You are "VidyaAI", a world-class, encouraging, and highly intelligent AI Study Companion and Academic Tutor for school and college students (CBSE, ICSE, State Boards, and global curricula).
Your primary language instruction:
Respond predominantly in ${language}.
- If language is "Hindi": use clear, natural Devanagari Hindi with standard academic terms where helpful.
- If language is "Hinglish": speak in modern, friendly Hinglish (Hindi written in Roman English script mixed with conversational English, just like how Indian students speak with their teachers/friends: e.g., "Yeh concept bahut simple hai. Chaliye step by step samajhte hain!").
- If language is "English": use clear, friendly, lucid English.

Tone & Pedagogy:
- Explain complex concepts with simple real-world analogies, step-by-step examples, and bullet points.
- Format math formulas clearly using standard readable notation or LaTeX (e.g., $E = mc^2$ or \`F = m * a\`).
- Use Markdown tables for comparisons.
- Always be encouraging, student-friendly, and accurate. Do not invent facts or fake syllabus references.
${subjectContext ? `Current subject context: ${subjectContext}.` : ''}
`;

    // Map conversation history
    const contents: any[] = [];
    for (const msg of messages) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    if (stream) {
      // Setup Server-Sent Events (SSE)
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({ text: response.text });
    }
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        error: err.message || 'An error occurred while generating response from Gemini.',
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

// Student Smart Notes Generator Endpoint
app.post('/api/generate-notes', async (req: Request, res: Response) => {
  try {
    const {
      studentClass,
      board,
      subject,
      chapterName,
      language = 'English',
      level,
      length,
      learningPurpose,
      examFocus,
      customInstructions,
      pdfBase64,
      pdfFileName,
    } = req.body;

    const effectiveLevel = level || length || 'Standard Study Notes';
    const effectivePurpose = learningPurpose || examFocus || 'Exam Preparation';

    if (!chapterName && !pdfBase64) {
      return res.status(400).json({
        error: 'Please provide either a Chapter name/number OR upload a chapter PDF document.',
      });
    }

    const ai = getGeminiClient();

    // Depth & Quality Level Guidance
    let levelGuidance = '';
    if (effectiveLevel === 'Quick Revision' || effectiveLevel === 'Ultra Short') {
      levelGuidance = `MODE: QUICK REVISION (Concise & Memorable)
- High-yield, high-density revision notes.
- Focus strictly on essential core concepts, critical definitions, must-know formulas, memory cues, and top 5 high-frequency exam questions.
- Exclude unnecessary preamble and fluff. Perfect for 10-15 minute pre-exam review.`;
    } else if (effectiveLevel === 'Complete Chapter Notes' || effectiveLevel === 'Detailed') {
      levelGuidance = `MODE: COMPLETE CHAPTER NOTES (Thorough & Comprehensive)
- Exhaustive coverage of ALL major topics and sub-topics from the curriculum or uploaded chapter document.
- Detailed step-by-step explanations, underlying mechanisms, full derivations, proofs, clear distinctions, multiple worked examples, and 10-12 practice revision questions with complete explanations.
- Explain "why" and "how" behind every principle.`;
    } else {
      // Standard Study Notes
      levelGuidance = `MODE: STANDARD STUDY NOTES (Balanced & Concept-Rich)
- Well-balanced, structured topic-wise explanations.
- Clear definitions, practical examples, essential formulas, comparison tables, common misconceptions, and 6-8 standard revision questions.
- Ideal for regular textbook study, classroom alignment, and weekly revision.`;
    }

    // Learning Purpose Guidance
    let purposeGuidance = '';
    if (effectivePurpose === 'Understand Concepts') {
      purposeGuidance = `LEARNING PURPOSE: UNDERSTAND CONCEPTS
- Prioritize crystal-clear conceptual clarity, intuitive real-world analogies, and breaking down complex jargon into relatable ideas.`;
    } else if (effectivePurpose === 'School Homework') {
      purposeGuidance = `LEARNING PURPOSE: SCHOOL HOMEWORK
- Prioritize textbook-accurate definitions, standard solved examples, structured answers suitable for school submissions, and key terminology.`;
    } else if (effectivePurpose === 'Exam Preparation') {
      purposeGuidance = `LEARNING PURPOSE: EXAM PREPARATION
- Prioritize high-scoring points, board marking schemes, common exam traps, comparison tables, and previous years' question patterns.`;
    } else {
      // Last-Minute Revision
      purposeGuidance = `LEARNING PURPOSE: LAST-MINUTE REVISION
- Prioritize rapid recall, high-frequency formulas, cheat sheet mind maps, and quick self-test Q&As.`;
    }

    // Deep Subject-Specific Intelligence
    let subjectAdaptation = '';
    const subLower = (subject || '').toLowerCase();
    if (subLower.includes('math')) {
      subjectAdaptation = `SUBJECT-SPECIFIC INTELLIGENCE: MATHEMATICS
1. Formulas & Conditions: State all formulas with exact conditions of applicability (e.g., domain restrictions, non-zero denominators).
2. Step-by-Step Worked Examples: Provide complete, clean mathematical derivations and solved representative textbook problems showing every single calculation step.
3. Proper Notation: Use standard mathematical notation (fractions, exponents, square roots, matrices, coordinates).
4. Common Calculation Errors: Explicitly warn about sign mistakes, cross-multiplication traps, and incorrect formula applications.
5. Practice Problems: Include high-yield exam practice problems with exact answers and hints.`;
    } else if (subLower.includes('physics')) {
      subjectAdaptation = `SUBJECT-SPECIFIC INTELLIGENCE: PHYSICS
1. Concepts & Laws: Clearly state definitions, scientific laws, principles, and physical significance.
2. Formulas & SI Units: List every formula with standard symbols, SI units, and dimensional equations where appropriate.
3. Worked Numericals: Provide solved numericals showing: Given data -> Formula used -> Step-by-step substitution -> Final answer with proper SI units.
4. Quantity Relationships: Explain direct and inverse proportions (e.g., how changing quantity X affects quantity Y).
5. Crucial Diagrams: Describe essential ray diagrams, circuit diagrams, or field lines in words with precise orientations.`;
    } else if (subLower.includes('chem')) {
      subjectAdaptation = `SUBJECT-SPECIFIC INTELLIGENCE: CHEMISTRY
1. Definitions & Chemical Symbols: Correct chemical nomenclature, valency, and states (s, l, g, aq).
2. Balanced Chemical Reactions: ALWAYS provide 100% correctly balanced chemical equations. NEVER fabricate or invent chemical reactions!
3. Observations vs Explanations: Clearly distinguish between visible observations (e.g., "color changes from blue to colorless, brown gas evolved") and microscopic explanations (e.g., oxidation state change, displacement).
4. Reaction Conditions: Mention catalysts, heat (delta), pressure, or temperature required.`;
    } else if (subLower.includes('bio')) {
      subjectAdaptation = `SUBJECT-SPECIFIC INTELLIGENCE: BIOLOGY
1. Logical Sequential Processes: Present physiological and biological cycles in clear chronological numbered stages (Step 1 -> Step 2 -> Step 3).
2. Structure vs Function: Explicitly relate anatomical structure to physiological function.
3. Important Terminology: Highlight technical biological terms with Latin/Greek roots or simple breakdowns.
4. Diagram Descriptions: Detail key diagrams with labeled parts described in clear words.
5. Cause-and-Effect: Explain what happens when a gland/enzyme/organ malfunctions.`;
    } else if (subLower.includes('history') || subLower.includes('geography') || subLower.includes('civic') || subLower.includes('social') || subLower.includes('pol')) {
      subjectAdaptation = `SUBJECT-SPECIFIC INTELLIGENCE: SOCIAL SCIENCES (HISTORY, GEOGRAPHY, CIVICS)
1. Chronological Timelines: Organize historical events chronologically with exact dates and key personalities.
2. Causes, Courses & Consequences: Clearly separate underlying causes, immediate triggers, key course of events, and long-term consequences.
3. Comparison Tables: Use comparison tables (e.g., Difference between Western & Eastern Ghats, Dictatorship vs Democracy).
4. Long Answer Structuring: Format points into high-scoring heading-plus-bullet paragraphs ideal for 3-mark and 5-mark board exam answers.`;
    } else if (subLower.includes('english') || subLower.includes('hindi') || subLower.includes('literature')) {
      subjectAdaptation = `SUBJECT-SPECIFIC INTELLIGENCE: LANGUAGES & LITERATURE
1. Central Theme & Summary: Clear synopsis of the chapter/poem.
2. Character Sketches: Key traits with textual justifications.
3. Poetic Devices / Grammar: Explanation of metaphors, similes, personification, or grammatical rules with examples.
4. Important QA: Format answers matching board marking criteria for character and theme questions.`;
    } else {
      subjectAdaptation = `SUBJECT-SPECIFIC INTELLIGENCE: GENERAL ACADEMIC
Emphasize clear definitions, practical examples, concept hierarchies, and standard revision questions.`;
    }

    const systemInstruction = `You are the Expert Master Teacher & Senior Syllabus Content Architect for "VidyaAI Smart Notes Studio".
You generate exceptionally clear, accurate, well-structured, exam-oriented student study notes for school and college curricula (CBSE, ICSE, State Boards, and global standards).

TARGET AUDIENCE & PARAMETERS:
- Class / Grade: ${studentClass || 'Class 10'}
- Education Board: ${board || 'CBSE (NCERT)'}
- Subject: ${subject || 'Science'}
- Chapter: ${chapterName || 'Uploaded Chapter Document'}
- Notes Level: ${effectiveLevel}
- Learning Purpose: ${effectivePurpose}
- Language: ${language}
  * If "Hindi": write purely in natural, grammatically correct Devanagari Hindi while preserving standard scientific/mathematical notation.
  * If "Hinglish": write in modern, student-friendly Hinglish (Hindi written in Roman English script mixed with conversational English: "Yeh concept bohot important hai board exams ke liye...").
  * If "English": write in crisp, articulate academic English.

${levelGuidance}
${purposeGuidance}
${subjectAdaptation}

MANDATORY 12-PART STRUCTURAL ARCHITECTURE:
Structure the output using clean Markdown with level 2 (##) and level 3 (###) headers:

## 1. Chapter Title, Class & Subject
[Metadata badges, board name, and syllabus context]

## 2. Learning Objectives
[3-5 clear bullet points stating what the student will master by reading these notes]

## 3. Chapter Overview
[A punchy, lucid 2-4 sentence introduction explaining the central theme and why it matters]

## 4. Topic-wise Explanations
[Detailed topic-wise breakdown with meaningful subheadings (###), clear explanations, and bullet points]

## 5. Key Definitions & Terminology
[Alphabetical or logical list of definitions with bold terms and concise meanings]

## 6. Important Facts, Concepts & Examples
[High-impact points, real-world examples, and evidence]

## 7. Formulas, Units & Step-by-Step Examples
[Formulas with units, standard notation, and worked step-by-step examples where applicable. If non-numerical, provide core principles]

## 8. Important Distinctions & Comparison Tables
[Markdown comparison tables contrasting related or easily confused concepts]

## 9. Common Misconceptions & Clarifications
[Explicit callouts: "Misconception vs Reality" to prevent student errors in exams]

## 10. Exam-Focused Key Points & Scoring Tips
[Top exam traps, previous year high-yield points, and teacher tips for scoring full marks]

## 11. Important Questions with Accurate Answers
[5 to 10 questions with complete answers formatted as:
**Q1: Question text?**
*Answer:* Complete answer explanation.]

## 12. Final Quick-Revision Sheet & Mind Map
[Ultra-compact bullet point recap and visual text mind-map for rapid 60-second review]

CRITICAL INTEGRITY RULES:
1. Base notes primarily on the provided chapter details or uploaded PDF. Do NOT fabricate fake formulas or non-existent chemical reactions.
2. Adapt format intelligently to the subject (e.g., skip chemical reactions for History; emphasize timelines for History).
3. Ensure high visual hierarchy with bold keywords, lists, and tables.`;

    const parts: any[] = [];

    if (pdfBase64) {
      parts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64,
        },
      });
      parts.push({
        text: `Please analyze this uploaded chapter PDF document (${pdfFileName || 'chapter.pdf'}) thoroughly.
Extract the learning objectives, key concepts, definitions, formulas, reactions, diagrams, and exam-critical information directly from this document, and generate the structured Smart Notes in ${language}.
Class: ${studentClass}, Board: ${board}, Subject: ${subject}, Chapter: ${chapterName || 'Uploaded Chapter PDF'}.
Notes Level: ${effectiveLevel}. Learning Purpose: ${effectivePurpose}.
${customInstructions ? `Student specific request: ${customInstructions}` : ''}`,
      });
    } else {
      parts.push({
        text: `Generate comprehensive, structured Smart Notes for:
Class/Grade: ${studentClass}
Board: ${board}
Subject: ${subject}
Chapter: ${chapterName}
Language: ${language}
Notes Level: ${effectiveLevel}
Learning Purpose: ${effectivePurpose}
${customInstructions ? `Additional Student Request: ${customInstructions}` : ''}`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    const notesContent = response.text || '';

    return res.json({
      notes: notesContent,
      meta: {
        chapterName: chapterName || pdfFileName || 'Chapter Notes',
        studentClass,
        board,
        subject,
        language,
        level: effectiveLevel,
        learningPurpose: effectivePurpose,
        generatedAt: new Date().toISOString(),
        hadPdf: Boolean(pdfBase64),
      },
    });
  } catch (err: any) {
    console.error('Generate notes error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate smart notes. Please verify your inputs and try again.',
    });
  }
});

// Notes Actions: Make Shorter, Make Detailed, Explain Point, Translate, Quiz, Flashcards
app.post('/api/notes-action', async (req: Request, res: Response) => {
  try {
    const { action, notesText, subject, targetLanguage, pointToExplain } = req.body;

    if (!notesText) {
      return res.status(400).json({ error: 'Notes text is required for this action.' });
    }

    const ai = getGeminiClient();

    if (action === 'make_shorter') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an expert student tutor. Condense the following academic notes into an "Ultra-Compact Cheat Sheet / Last Minute Revision Sheet".
Preserve all vital formulas, core definitions, and top exam points, but strip all extra narrative text. Use high-impact bullet points and short tables. Keep the original language style.

ORIGINAL NOTES:
${notesText}`,
      });

      return res.json({ result: response.text });
    }

    if (action === 'make_detailed') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are a master academic teacher. Expand the following study notes into "Complete Chapter Notes".
Add in-depth conceptual explanations, underlying mechanisms, full derivations, additional worked examples, comparison tables, common misconceptions, and 3 more practice questions with answers. Keep the original language style.

ORIGINAL NOTES:
${notesText}`,
      });

      return res.json({ result: response.text });
    }

    if (action === 'explain_point') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are a friendly, encouraging academic tutor.
A student is finding this specific topic/point difficult: "${pointToExplain || 'the core concept'}".
Based on the context of the notes below, explain this topic in the simplest, most intuitive way possible (like explaining to a 10-year-old using the Feynman Technique).
Use:
1. A vivid, relatable real-life analogy (e.g., using sports, cooking, smartphones, or everyday life).
2. Step-by-step breakdown.
3. Why it matters in exams.
4. One practice memory trick or mnemonic.
Keep the explanation engaging and friendly.

NOTES CONTEXT:
${notesText.slice(0, 3500)}`,
      });

      return res.json({ result: response.text });
    }

    if (action === 'translate') {
      const lang = targetLanguage || 'Hindi';
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Translate the following academic notes into ${lang}.
- If translating to Hindi: Use natural, clean Devanagari Hindi while preserving standard scientific/mathematical notation.
- If translating to Hinglish: Use modern, easy-to-read Hinglish (Roman English script mixed with conversational Hindi).
- If translating to English: Use clear, academic English.
Keep all Markdown headings, bullet points, and code formatting intact.

NOTES TO TRANSLATE:
${notesText}`,
      });

      return res.json({ result: response.text });
    }

    if (action === 'generate_quiz') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Based on the following academic study notes, generate an interactive 5-question multiple choice quiz (MCQ) to test the student's conceptual understanding and recall.
Return your response ONLY as a strict, valid JSON array of question objects without markdown wrapping or code fences.
Each object must have the following exact schema:
{
  "id": 1,
  "question": "Question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": 0, // 0-based index of correct option
  "explanation": "Why this option is correct and why other common traps are incorrect.",
  "difficulty": "Easy" | "Medium" | "Hard"
}

NOTES:
${notesText.slice(0, 5000)}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const rawJson = response.text || '[]';
      try {
        const parsed = JSON.parse(rawJson);
        return res.json({ quiz: parsed });
      } catch (parseErr) {
        const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ quiz: parsed });
      }
    }

    if (action === 'generate_flashcards') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Based on the following academic notes, extract 6 to 8 high-yield flashcards for active recall and spaced repetition.
Each flashcard should cover a core definition, vital formula, key historical date/personality, or scientific law.
Return your response ONLY as a strict JSON array of flashcard objects without code fences or extra text.
Schema:
[
  {
    "id": 1,
    "front": "Term, Concept, or Question (Prompt)",
    "back": "Clear, concise definition, formula, or explanation (Answer)",
    "category": "Definition" | "Formula" | "Key Concept" | "Exam Trap"
  }
]

NOTES:
${notesText.slice(0, 5000)}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const rawJson = response.text || '[]';
      try {
        const parsed = JSON.parse(rawJson);
        return res.json({ flashcards: parsed });
      } catch (parseErr) {
        const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ flashcards: parsed });
      }
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (err: any) {
    console.error('Notes action error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to perform requested note action.',
    });
  }
});

// Configure Vite middleware in development or static serving in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode.');
  } else {
    // Production: serve built static assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('Serving production build from dist directory.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VidyaAI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
